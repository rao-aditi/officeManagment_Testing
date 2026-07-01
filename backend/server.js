require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./src/OfficeManagment/auth/auth.routes");
const usersRoutes = require("./src/OfficeManagment/users/users.routes");
const clientRoutes = require("./src/OfficeManagment/Client/client.routes");
const tasksRoutes = require("./src/OfficeManagment/Tasks/tasks.routes");
const dueDatesRoutes = require("./src/OfficeManagment/DueDates_Remainders/duedate.routes");
const permissionsRoutes = require("./src/OfficeManagment/permissions/permissions.routes");
const enumsRoutes = require("./src/OfficeManagment/enums/enums.routes");
const serviceTypesRoutes = require("./src/OfficeManagment/ServiceTypes/serviceTypes.routes");
const quotationsRoutes = require("./src/OfficeManagment/Quotations/quotations.routes");
const invoicesRoutes = require("./src/OfficeManagment/Invoices/invoices.routes");
const paymentsRoutes = require("./src/OfficeManagment/Payments/payments.routes");
const documentsRoutes = require("./src/OfficeManagment/Documents/Documents.routes");
const documentTypesRoutes = require("./src/OfficeManagment/DocumentTypes/documentTypes.routes");
const googleDriveRoutes = require("./src/OfficeManagment/GoogleDrive/googleDrive.routes");
const reportsRoutes = require("./src/OfficeManagment/Reports/reports.routes");
const errorHandler = require("./src/OfficeManagment/middleware/errorHandler");


const hufRoutes = require("./src/services/software/common/modules/huf/huf.routes.js")

const clientsRoutes = require(
  "./src/services/software/common/modules/clients/clients.routes"
);

const cooperativeSocietyRoutes = require(
  "./src/services/software/common/modules/cooperative-society/cooperative-society.routes"
);

const localAuthorityRoutes = require(
  "./src/services/software/common/modules/local-authority/local-authority.routes"
);

const artificialJuridicalPersonRoutes = require(
  "./src/services/software/common/modules/artificial-juridical-person/artificial-juridical-person.routes"
);

const privateCompanyRoutes = require(

  "./src/services/software/common/modules/company-private/company-private.routes"
);

const publicCompanyRoutes = require(
  "./src/services/software/common/modules/company-public-interested/company-public-interested.routes"
);

const aopRoutes = require(
  "./src/services/software/common/modules/aop/aop.routes.js"
);

const individualRoutes = require("./src/services/software/common/modules/individual/individual.routes.js")

const firmRoutes = require(
  "./src/services/software/common/modules/firm/firm.routes"
);

const trustRoutes = require(
  "./src/services/software/common/modules/aop-trust/aop-trust.routes"
);

const bodyOfIndividualRoutes = require(
  "./src/services/software/common/modules/body-of-individual/body-of-individual.routes"
);

const companyPublicNotInterestedRoutes = require(
  "./src/services/software/common/modules/company-public-not-interested/company-public-not-interested.routes"
);
const { startScheduler } = require("./src/OfficeManagment/DueDates_Remainders/TaskRemainder_Scheduler.js");


const app = express();

// PORT
const Port = process.env.PORT || 5001;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});


// MIDDLEWARES
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));


// ROUTES
app.use("/api/huf", hufRoutes);

app.use(
  "/api/companies/private",
  privateCompanyRoutes
);

app.use(
  '/api/companies/public-not-interested',
  companyPublicNotInterestedRoutes
);

app.use(
  "/api/companies/public",
  publicCompanyRoutes
);
app.use("/api/clients", clientsRoutes);

app.use("/api/aop", aopRoutes);

app.use(
  "/api/cooperative-society",
  cooperativeSocietyRoutes
);

app.use(
  "/api/local-authority",
  localAuthorityRoutes
);

app.use(
  "/api/artificial-juridical-person",
  artificialJuridicalPersonRoutes
);

app.use("/api/individual", individualRoutes);


app.use("/api/firm", firmRoutes);

app.use("/api/trust", trustRoutes);

app.use(
  "/api/body-of-individual",
  bodyOfIndividualRoutes
);

// office Manage Management

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/getEnums", enumsRoutes);
app.use("/api/user", usersRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/task", tasksRoutes);
app.use("/api/due-dates", dueDatesRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/service-type", serviceTypesRoutes);
app.use("/api/quotation", quotationsRoutes);
app.use("/api/invoice", invoicesRoutes);
app.use("/api/payment", paymentsRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/document-type", documentTypesRoutes);
app.use("/api/google-drive", googleDriveRoutes);
app.use("/api/reports", reportsRoutes);
app.use(errorHandler);

// SERVER START
app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);

  startScheduler();

  console.log("Scheduler started successfully");
});