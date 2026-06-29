-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('INDIVIDUAL', 'FIRM', 'AOP', 'AOP_TRUST', 'BODY_OF_INDIVIDUAL', 'ARTIFICIAL_JUDICIAL_PERSON', 'COOPERATIVE_SOCIETY', 'HUF', 'COMPANY_PUBLIC_INTERESTED', 'COMPANY_PUBLIC_NOT_INTERESTED', 'COMPANY_PRIVATE', 'LOCAL_AUTHORITY');

-- CreateEnum
CREATE TYPE "PassportStatus" AS ENUM ('YES', 'NO', 'NA');

-- CreateEnum
CREATE TYPE "ResidentialStatus" AS ENUM ('RESIDENT', 'NON_RESIDENT', 'NOT_ORDINARILY_RESIDENT');

-- CreateEnum
CREATE TYPE "FIIFPIStatus" AS ENUM ('YES', 'NO');

-- CreateEnum
CREATE TYPE "MSMEStatus" AS ENUM ('YES', 'NO');

-- CreateEnum
CREATE TYPE "EnterpriseType" AS ENUM ('MICRO', 'SMALL', 'MEDIUM');

-- CreateEnum
CREATE TYPE "MajorActivity" AS ENUM ('MANUFACTURING', 'SERVICES', 'TRADING');

-- CreateEnum
CREATE TYPE "NatureOfBusiness" AS ENUM ('EXPORT', 'MANUFACTURING', 'MANUFACTURING_AND_TRADING', 'RETAIL_TRADING', 'WHOLESALE_BUSINESS', 'WHOLESALE_CUM_RETAIL', 'CONSTRUCTION_BUSINESS', 'SERVICE_PROVIDER', 'FINANCING_SERVICES', 'SHARES_AND_BROKERAGE', 'IMPORT', 'LESSOR', 'LESSEE', 'WORK_CONTRACTOR');

-- CreateEnum
CREATE TYPE "StockValuationMethod" AS ENUM ('COST_PRICE', 'MARKET_PRICE', 'AVERAGE_COST_METHOD', 'COST_OR_MARKET_WHICHEVER_LESS', 'FIFO', 'LIFO');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "CompanyCategoryPrime" AS ENUM ('LIMITED_BY_SHARES', 'LIMITED_BY_MEMBERS', 'LIMITED_BY_GUARANTOR', 'UNLIMITED_COMPANY');

-- CreateEnum
CREATE TYPE "CompanySub" AS ENUM ('UNION_GOVERNMENT_COMPANY', 'STATE_GOVERNMENT_COMPANY', 'INDIAN_NON_GOVERNMENT_COMPANY', 'SUBSIDIARY_OF_FOREIGN_COMPANY', 'COMPANY_LICENSED_UNDER_SECTION_25', 'GUARANTEE_AND_ASSOCIATION_COMPANY', 'OTHERS');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('NEW', 'PRODUCER', 'SECTION_8_COMPANY', 'PART_I_COMPANY_CHAPTER_XXI');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('DRAFT', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED', 'COMPLETED', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "RegistrarOfCompany" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RegistrarOfCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "group" TEXT,
    "entityType" "EntityType" NOT NULL,
    "prefix" TEXT,
    "name" TEXT NOT NULL,
    "dateOfDeed" TIMESTAMP(3),
    "dateOfFormation" TIMESTAMP(3),
    "dateOfIncorporation" TIMESTAMP(3),
    "firstName" TEXT,
    "middleName" TEXT,
    "lastName" TEXT,
    "fatherName" TEXT,
    "spouseName" TEXT,
    "qualification" TEXT,
    "nationality" TEXT,
    "occupation" TEXT,
    "uinNo" TEXT,
    "nameAsPerUIN" TEXT,
    "mobileLinkedWithUIN" TEXT,
    "passportStatus" "PassportStatus",
    "passportNumber" TEXT,
    "gender" "Gender",
    "votersId" TEXT,
    "dob" TIMESTAMP(3),
    "dod" TIMESTAMP(3),
    "residentialStatus" "ResidentialStatus",
    "pan" TEXT,
    "tan" TEXT,
    "din" TEXT,
    "dateOfCommencementOfBusiness" TIMESTAMP(3),
    "isFIIFPI" "FIIFPIStatus",
    "sebiRegnNo" TEXT,
    "isMSME" "MSMEStatus",
    "msmeRegistrationNo" TEXT,
    "msmeRegistrationDate" TIMESTAMP(3),
    "enterpriseType" "EnterpriseType",
    "majorActivity" "MajorActivity",
    "businessName" TEXT,
    "contactPerson" TEXT,
    "natureOfBusiness" "NatureOfBusiness",
    "stockValuationMethod" "StockValuationMethod",
    "gstNo" TEXT,
    "gstStartDate" TIMESTAMP(3),
    "gstEndDate" TIMESTAMP(3),
    "vatRegNo" TEXT,
    "centralSalesTaxNo" TEXT,
    "serviceTaxRegNo" TEXT,
    "otherRegistration" TEXT,
    "isLLP" BOOLEAN NOT NULL DEFAULT false,
    "llpId" TEXT,
    "oldCompanyName" TEXT,
    "registrarOfCompanyId" INTEGER,
    "cin" TEXT,
    "gln" TEXT,
    "companyCategory" "CompanyCategoryPrime",
    "companySub" "CompanySub",
    "companyCategoryOtherSpecify" TEXT,
    "sec8LicenceNo" TEXT,
    "companyType" "CompanyType",
    "havingShareCapital" BOOLEAN,
    "isPrivateOnePersonCompany" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SigningPerson" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fatherName" TEXT,
    "designation" TEXT,
    "gender" "Gender",
    "panNo" TEXT,
    "dob" TIMESTAMP(3),

    CONSTRAINT "SigningPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "roleId" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdBy" TEXT,
    "teamLeaderId" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "clientId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "assignedToId" TEXT,
    "assignedById" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskChecklist" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskReminder" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "remindAt" TIMESTAMP(3) NOT NULL,
    "reminderType" TEXT,
    "message" TEXT,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskStatusHistory" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fromStatus" "TaskStatus",
    "toStatus" "TaskStatus" NOT NULL,
    "changedById" TEXT NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RegistrarOfCompany_name_key" ON "RegistrarOfCompany"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Client_code_key" ON "Client"("code");

-- CreateIndex
CREATE INDEX "Client_entityType_idx" ON "Client"("entityType");

-- CreateIndex
CREATE INDEX "Client_pan_idx" ON "Client"("pan");

-- CreateIndex
CREATE UNIQUE INDEX "SigningPerson_clientId_key" ON "SigningPerson"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "User_teamLeaderId_idx" ON "User"("teamLeaderId");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE INDEX "Task_clientId_idx" ON "Task"("clientId");

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

-- CreateIndex
CREATE INDEX "Task_assignedById_idx" ON "Task"("assignedById");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");

-- CreateIndex
CREATE INDEX "TaskChecklist_taskId_idx" ON "TaskChecklist"("taskId");

-- CreateIndex
CREATE INDEX "TaskChecklist_isCompleted_idx" ON "TaskChecklist"("isCompleted");

-- CreateIndex
CREATE INDEX "TaskReminder_taskId_idx" ON "TaskReminder"("taskId");

-- CreateIndex
CREATE INDEX "TaskReminder_userId_idx" ON "TaskReminder"("userId");

-- CreateIndex
CREATE INDEX "TaskReminder_remindAt_idx" ON "TaskReminder"("remindAt");

-- CreateIndex
CREATE INDEX "TaskReminder_status_idx" ON "TaskReminder"("status");

-- CreateIndex
CREATE INDEX "TaskStatusHistory_taskId_idx" ON "TaskStatusHistory"("taskId");

-- CreateIndex
CREATE INDEX "TaskStatusHistory_changedById_idx" ON "TaskStatusHistory"("changedById");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_registrarOfCompanyId_fkey" FOREIGN KEY ("registrarOfCompanyId") REFERENCES "RegistrarOfCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SigningPerson" ADD CONSTRAINT "SigningPerson_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskChecklist" ADD CONSTRAINT "TaskChecklist_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskChecklist" ADD CONSTRAINT "TaskChecklist_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskReminder" ADD CONSTRAINT "TaskReminder_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskReminder" ADD CONSTRAINT "TaskReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskReminder" ADD CONSTRAINT "TaskReminder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskStatusHistory" ADD CONSTRAINT "TaskStatusHistory_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskStatusHistory" ADD CONSTRAINT "TaskStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
