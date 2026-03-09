CREATE TABLE "Order" (
    "orderId" VARCHAR(255) PRIMARY KEY,
    "value" NUMERIC(15, 2) NOT NULL,
    "creationDate" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Items" (
    "orderId" VARCHAR(255) NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" NUMERIC(15, 2) NOT NULL,
    PRIMARY KEY ("orderId", "productId"),
    CONSTRAINT fk_order FOREIGN KEY ("orderId") REFERENCES "Order" ("orderId") ON DELETE CASCADE
);
