/*
  Warnings:

  - You are about to drop the column `image` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `MessageRelation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `chatId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cipherText` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptedKeyForReceiver` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptedKeyForSender` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iv` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MessageRelation" DROP CONSTRAINT "MessageRelation_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MessageRelation" DROP CONSTRAINT "MessageRelation_messageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MessageRelation" DROP CONSTRAINT "MessageRelation_senderId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "image",
DROP COLUMN "text",
DROP COLUMN "video",
ADD COLUMN     "chatId" TEXT NOT NULL,
ADD COLUMN     "cipherText" TEXT NOT NULL,
ADD COLUMN     "encryptedKeyForReceiver" TEXT NOT NULL,
ADD COLUMN     "encryptedKeyForSender" TEXT NOT NULL,
ADD COLUMN     "iv" TEXT NOT NULL,
ADD COLUMN     "senderId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."MessageRelation";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
