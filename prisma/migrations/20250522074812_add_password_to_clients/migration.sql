/*
  Warnings:

  - Added the required column `password` to the `Client` table without a default value. This is not possible if the table is not empty.

*/ -- AlterTable

ALTER TABLE "Client" ADD COLUMN "password" TEXT NOT NULL DEFAULT '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBAQN3J9QqJ9Hy';

-- Remove default value after adding the column

ALTER TABLE "Client"
ALTER COLUMN "password"
DROP DEFAULT;

