-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "reg_id" VARCHAR(15) NOT NULL,
    "usn" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "event_id" INTEGER NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentInfo" (
    "payment_id" VARCHAR(10) NOT NULL,
    "group_leader_id" INTEGER NOT NULL,
    "group_leader_usn" VARCHAR(20) NOT NULL,
    "event_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentInfo_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "EventParticipant" (
    "event_id" INTEGER NOT NULL,
    "participant_id" INTEGER NOT NULL,
    "participant_usn" VARCHAR(20) NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("event_id","participant_id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "participant_id" INTEGER NOT NULL,
    "participant_name" VARCHAR(255) NOT NULL,
    "participant_usn" VARCHAR(20) NOT NULL,
    "participant_phone" VARCHAR(15) NOT NULL,
    "participant_email" VARCHAR(255) NOT NULL,
    "participant_college_name" VARCHAR(255) NOT NULL,
    "participant_accommodation" VARCHAR(10) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("participant_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_reg_id_key" ON "User"("reg_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_usn_key" ON "User"("usn");

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "Participant"("participant_id") ON DELETE RESTRICT ON UPDATE CASCADE;
