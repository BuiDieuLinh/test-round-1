-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('Created', 'Paid', 'Canceled');

-- CreateTable
CREATE TABLE "customer" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_table" (
    "id" TEXT NOT NULL,
    "table_number" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "restaurant_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_table" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "booking_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_table_table_number_key" ON "restaurant_table"("table_number");

-- CreateIndex
CREATE INDEX "booking_status_created_at_idx" ON "booking"("status", "created_at");

-- CreateIndex
CREATE INDEX "booking_table_table_id_booking_time_idx" ON "booking_table"("table_id", "booking_time");

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_table" ADD CONSTRAINT "booking_table_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "restaurant_table"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
