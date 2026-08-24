-- DropForeignKey
ALTER TABLE "CustomDomain" DROP CONSTRAINT "CustomDomain_publicationId_fkey";

-- DropForeignKey
ALTER TABLE "CustomDomain" DROP CONSTRAINT "CustomDomain_userId_fkey";

-- AlterTable
ALTER TABLE "PortfolioPublication" ADD COLUMN     "publicCode" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT;

-- DropTable
DROP TABLE "CustomDomain";

-- DropEnum
DROP TYPE "DomainStatus";

-- CreateIndex
CREATE UNIQUE INDEX "PortfolioPublication_publicCode_key" ON "PortfolioPublication"("publicCode");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

