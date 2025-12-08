-- CreateTable
CREATE TABLE "documentation_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sidebarPosition" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentation_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentation_sections" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sidebarPosition" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "documentation_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentation_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "sidebarPosition" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "documentation_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documentation_products_slug_key" ON "documentation_products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "documentation_sections_productId_slug_key" ON "documentation_sections"("productId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "documentation_pages_sectionId_slug_key" ON "documentation_pages"("sectionId", "slug");

-- AddForeignKey
ALTER TABLE "documentation_sections" ADD CONSTRAINT "documentation_sections_productId_fkey" FOREIGN KEY ("productId") REFERENCES "documentation_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentation_pages" ADD CONSTRAINT "documentation_pages_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "documentation_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
