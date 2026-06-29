const { google } = require("googleapis");
const { Readable } = require("stream");
const jwt = require("jsonwebtoken");
const prisma = require("../../shared/prisma");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const DRIVE_ROOT_FOLDER = "Office GST Documents";

const FOLDER_MAP = {
  INVOICE: "Invoice Documents",
  CLIENT: "Client Documents",
  TASK: "Task Documents",
  DEFAULT: "Other Documents",
};

const sanitizeFolderName = (name) =>
  String(name || "Untitled")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim()
    .slice(0, 200) || "Untitled";

const resolveFolderType = ({ taskId, invoiceId, clientId } = {}) => {
  if (taskId) return "TASK";
  if (invoiceId) return "INVOICE";
  if (clientId) return "CLIENT";
  return "DEFAULT";
};

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "dev_access_secret";

const getOAuth2Client = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    const err = new Error(
      "Google Drive is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI."
    );
    err.statusCode = 503;
    throw err;
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const getAuthUrl = (userId) => {
  const oauth2Client = getOAuth2Client();
  const state = jwt.sign({ userId, purpose: "google_drive" }, ACCESS_SECRET, {
    expiresIn: "10m",
  });

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    state,
  });
};

const saveTokensForUser = async (userId, tokens, email = null) => {
  const expiryDate = tokens.expiry_date
    ? new Date(tokens.expiry_date)
    : tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      googleDriveConnected: true,
      googleDriveAccessToken: tokens.access_token || null,
      googleDriveRefreshToken: tokens.refresh_token || undefined,
      googleDriveTokenExpiry: expiryDate,
      ...(email ? { googleDriveEmail: email } : {}),
    },
  });
};

const handleOAuthCallback = async (code, state) => {
  let decoded;
  try {
    decoded = jwt.verify(state, ACCESS_SECRET);
  } catch {
    const err = new Error("Invalid or expired OAuth state.");
    err.statusCode = 400;
    throw err;
  }

  if (!decoded?.userId || decoded.purpose !== "google_drive") {
    const err = new Error("Invalid OAuth state payload.");
    err.statusCode = 400;
    throw err;
  }

  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  let email = null;
  try {
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const profile = await oauth2.userinfo.get();
    email = profile.data.email || null;
  } catch (_) { }

  const existing = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { googleDriveRefreshToken: true },
  });

  if (!tokens.refresh_token && !existing?.googleDriveRefreshToken) {
    const err = new Error(
      "Google did not return a refresh token. Please revoke app access in Google Account settings and try again."
    );
    err.statusCode = 400;
    throw err;
  }

  await saveTokensForUser(decoded.userId, {
    ...tokens,
    refresh_token: tokens.refresh_token || existing.googleDriveRefreshToken,
  }, email);

  return decoded.userId;
};

const getDriveStatus = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleDriveConnected: true,
      googleDriveEmail: true,
      googleDriveRefreshToken: true,
    },
  });

  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  const connected = Boolean(
    user.googleDriveConnected && user.googleDriveRefreshToken
  );

  return {
    connected,
    email: user.googleDriveEmail || null,
  };
};

const disconnectDrive = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      googleDriveConnected: false,
      googleDriveAccessToken: null,
      googleDriveRefreshToken: null,
      googleDriveTokenExpiry: null,
      googleDriveEmail: null,
      googleDriveFolderId: null,
    },
  });
};

const getAuthenticatedClient = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      googleDriveConnected: true,
      googleDriveAccessToken: true,
      googleDriveRefreshToken: true,
      googleDriveTokenExpiry: true,
      googleDriveFolderId: true,
    },
  });

  if (!user?.googleDriveConnected || !user.googleDriveRefreshToken) {
    const err = new Error(
      "Firstly connect with Google Drive before uploading documents."
    );
    err.statusCode = 403;
    throw err;
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.googleDriveAccessToken,
    refresh_token: user.googleDriveRefreshToken,
    expiry_date: user.googleDriveTokenExpiry
      ? user.googleDriveTokenExpiry.getTime()
      : undefined,
  });

  oauth2Client.on("tokens", async (tokens) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(tokens.access_token
            ? { googleDriveAccessToken: tokens.access_token }
            : {}),
          ...(tokens.refresh_token
            ? { googleDriveRefreshToken: tokens.refresh_token }
            : {}),
          ...(tokens.expiry_date
            ? { googleDriveTokenExpiry: new Date(tokens.expiry_date) }
            : {}),
        },
      });
    } catch (error) {
      console.error("Failed to persist refreshed Google Drive tokens:", error);
    }
  });

  return { oauth2Client, folderId: user.googleDriveFolderId };
};

/* ROOT FOLDER  */
const ensureRootFolder = async (drive) => {
  const res = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${DRIVE_ROOT_FOLDER}' and trashed=false`,
    fields: "files(id)",
  });

  if (res.data.files?.length) return res.data.files[0].id;

  const folder = await drive.files.create({
    requestBody: {
      name: DRIVE_ROOT_FOLDER,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  return folder.data.id;
};

/* SUB FOLDER */
const ensureSubFolder = async (drive, parentId, name) => {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id)",
  });

  if (res.data.files?.length) return res.data.files[0].id;

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });

  return folder.data.id;
};

const uploadFileToDrive = async (
  userId,
  { buffer, originalName, mimeType, folderType = "DEFAULT", subFolderName }
) => {
  const { oauth2Client } = await getAuthenticatedClient(userId);
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const rootFolderId = await ensureRootFolder(drive);

  const folderName = FOLDER_MAP[folderType] || FOLDER_MAP.DEFAULT;

  const categoryFolderId = await ensureSubFolder(
    drive,
    rootFolderId,
    folderName
  );

  const targetFolderId = subFolderName
    ? await ensureSubFolder(
        drive,
        categoryFolderId,
        sanitizeFolderName(subFolderName)
      )
    : categoryFolderId;

  const file = await drive.files.create({
    requestBody: {
      name: originalName,
      parents: [targetFolderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink, size",
  });

  return {
    driveFileId: file.data.id,
    driveUrl: file.data.webViewLink,
    fileSize: Number(file.data.size || buffer.length),
  };
};

const downloadFileFromDrive = async (userId, driveFileId) => {
  const { oauth2Client } = await getAuthenticatedClient(userId);
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const response = await drive.files.get(
    { fileId: driveFileId, alt: "media" },
    { responseType: "stream" }
  );

  return response.data;
};

const deleteFileFromDrive = async (userId, driveFileId) => {
  if (!driveFileId) return;

  try {
    const { oauth2Client } = await getAuthenticatedClient(userId);
    const drive = google.drive({ version: "v3", auth: oauth2Client });
    await drive.files.delete({ fileId: driveFileId });
  } catch (error) {
    console.error("Failed to delete Google Drive file:", error.message);
  }
};

module.exports = {
  getAuthUrl,
  handleOAuthCallback,
  getDriveStatus,
  disconnectDrive,
  resolveFolderType,
  uploadFileToDrive,
  downloadFileFromDrive,
  deleteFileFromDrive,
};
