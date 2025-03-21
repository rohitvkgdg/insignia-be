/*
  Warnings:

  - You are about to drop the `EventParticipant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Participant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EventParticipant" DROP CONSTRAINT "EventParticipant_participant_id_fkey";

-- DropTable
DROP TABLE "EventParticipant";

-- DropTable
DROP TABLE "Participant";

-- DropTable
DROP TABLE "PaymentInfo";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Registrations" (
    "reg_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "event_id" INTEGER NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "unique_id" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registrations_pkey" PRIMARY KEY ("reg_id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "bid" SERIAL NOT NULL,
    "bname" VARCHAR(50) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("bid")
);

-- CreateTable
CREATE TABLE "Admins" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(250) NOT NULL,
    "password" VARCHAR(255) NOT NULL,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categories" (
    "cid" SERIAL NOT NULL,
    "cname" VARCHAR(50) NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("cid")
);

-- CreateTable
CREATE TABLE "Events" (
    "eid" SERIAL NOT NULL,
    "ename" VARCHAR(20) NOT NULL,
    "description" VARCHAR(5000) NOT NULL,
    "venue" VARCHAR(50) NOT NULL,
    "timing" TIME(0) NOT NULL,
    "date" DATE NOT NULL,
    "poster_link" TEXT,
    "register" VARCHAR(200),
    "coordinator1" VARCHAR(50),
    "coordinator2" VARCHAR(50),
    "c1phone" VARCHAR(20),
    "c2phone" VARCHAR(20),
    "rules" VARCHAR(9000),
    "bid" INTEGER,
    "cid" INTEGER,
    "prize" INTEGER,
    "participants" INTEGER,
    "unique_code" VARCHAR(20) NOT NULL,
    "event_type" VARCHAR(20) NOT NULL,
    "min_participants" INTEGER,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("eid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Registrations_unique_id_key" ON "Registrations"("unique_id");

-- CreateIndex
CREATE UNIQUE INDEX "Admins_email_key" ON "Admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Events_unique_code_key" ON "Events"("unique_code");

-- AddForeignKey
ALTER TABLE "Registrations" ADD CONSTRAINT "Registrations_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "Branch"("bid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registrations" ADD CONSTRAINT "Registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events"("eid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registrations" ADD CONSTRAINT "Registrations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Categories"("cid") ON DELETE RESTRICT ON UPDATE CASCADE;
