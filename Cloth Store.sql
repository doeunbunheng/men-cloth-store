SELECT SYS_CONTEXT('USERENV', 'CON_NAME') AS container_name FROM dual;
SHOW USER;

-- ============================================================
-- STEP 1: CREATE TABLES
-- ============================================================

CREATE TABLE products (
    product_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR2(100)  NOT NULL,
    category     VARCHAR2(50),
    size_        VARCHAR2(10),
    color        VARCHAR2(30),
    price        NUMBER(10,2)   NOT NULL,
    stock_qty    NUMBER         DEFAULT 0
);

CREATE TABLE users (
    user_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username     VARCHAR2(50)   UNIQUE NOT NULL,
    password     VARCHAR2(200)  NOT NULL,
    role         VARCHAR2(20)   CHECK (role IN ('Admin','Sale','Customer')),
    created_date DATE           DEFAULT SYSDATE
);

CREATE TABLE customers (
    customer_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id      NUMBER,
    full_name    VARCHAR2(100)  NOT NULL,
    email        VARCHAR2(100)  UNIQUE,
    phone        VARCHAR2(20),
    address      VARCHAR2(200),
    created_date DATE           DEFAULT SYSDATE,
    CONSTRAINT fk_cust_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE orders (
    order_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id  NUMBER         NOT NULL,
    user_id      NUMBER,
    order_date   DATE           DEFAULT SYSDATE,
    status       VARCHAR2(20)   DEFAULT 'Pending'
                 CHECK (status IN ('Pending','Confirmed','Shipped','Completed','Cancelled')),
    total_amount NUMBER(10,2),
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    CONSTRAINT fk_order_user     FOREIGN KEY (user_id)     REFERENCES users(user_id)
);

CREATE TABLE order_items (
    item_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id     NUMBER         NOT NULL,
    product_id   NUMBER         NOT NULL,
    quantity     NUMBER         NOT NULL,
    unit_price   NUMBER(10,2)   NOT NULL,
    CONSTRAINT fk_item_order   FOREIGN KEY (order_id)   REFERENCES orders(order_id),
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE sales_log (
    log_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id     NUMBER,
    user_id      NUMBER,
    action       VARCHAR2(50),
    log_date     DATE DEFAULT SYSDATE,
    CONSTRAINT fk_log_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
);


-- ============================================================
-- STEP 2: PRODUCT VARIANTS SUPPORT
-- ============================================================

CREATE TABLE product_variants (
    variant_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id  NUMBER NOT NULL,
    size_       VARCHAR2(10),
    color       VARCHAR2(30),
    stock_qty   NUMBER DEFAULT 0,
    CONSTRAINT fk_var_product2 FOREIGN KEY (product_id)
    REFERENCES products(product_id)
);

ALTER TABLE order_items ADD selected_size  VARCHAR2(10);
ALTER TABLE order_items ADD selected_color VARCHAR2(30);

ALTER TABLE products ADD image_url VARCHAR2(500);

COMMIT;



-- ============================================================
-- STEP 3: CREATE VIEWS
-- ============================================================

CREATE OR REPLACE VIEW v_sales_report AS
SELECT
    o.order_id,
    NVL(c.full_name, 'Unknown') AS customer_name,
    u.username                  AS sold_by,
    TO_CHAR(o.order_date, 'YYYY-MM-DD') AS order_date,
    o.status,
    o.total_amount
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN users u     ON o.user_id     = u.user_id;

CREATE OR REPLACE VIEW v_product_stock AS
SELECT product_id, product_name, category, size_,
       color, price, stock_qty, image_url
FROM products
ORDER BY stock_qty ASC;

CREATE OR REPLACE VIEW v_order_detail AS
SELECT
    oi.order_id,
    p.product_name,
    p.size_,
    p.color,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price) AS subtotal
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id;

CREATE OR REPLACE VIEW v_registered_customers AS
SELECT
    u.user_id,
    u.username,
    u.role,
    c.full_name,
    c.email,
    c.phone,
    c.address,
    u.created_date AS register_date
FROM users u
JOIN customers c ON c.user_id = u.user_id
WHERE u.role = 'Customer'
ORDER BY u.created_date DESC;


-- ============================================================
-- STEP 4: CREATE TRIGGERS
-- ============================================================

CREATE OR REPLACE TRIGGER trg_reduce_stock
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET stock_qty = stock_qty - :NEW.quantity
    WHERE product_id = :NEW.product_id;
END;
/

CREATE OR REPLACE TRIGGER trg_order_status_log
AFTER UPDATE OF status ON orders
FOR EACH ROW
BEGIN
    IF :NEW.status != :OLD.status THEN
        INSERT INTO sales_log (order_id, user_id, action, log_date)
        VALUES (:NEW.order_id, :NEW.user_id,
                'STATUS_' || :NEW.status, SYSDATE);
    END IF;
END;
/

CREATE OR REPLACE TRIGGER trg_sales_log
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO sales_log (order_id, user_id, action, log_date)
    VALUES (:NEW.order_id, :NEW.user_id, 'ORDER_CREATED', SYSDATE);
END;
/

CREATE OR REPLACE TRIGGER trg_sync_product_stock
FOR INSERT OR UPDATE OR DELETE ON product_variants
COMPOUND TRIGGER

    v_product_id NUMBER;

    AFTER EACH ROW IS
    BEGIN
        v_product_id := COALESCE(:NEW.product_id, :OLD.product_id);
    END AFTER EACH ROW;

    AFTER STATEMENT IS
    BEGIN
        UPDATE products
        SET stock_qty = (
            SELECT NVL(SUM(stock_qty), 0)
            FROM product_variants
            WHERE product_id = v_product_id
        )
        WHERE product_id = v_product_id;
    END AFTER STATEMENT;

END trg_sync_product_stock;
/

CREATE OR REPLACE TRIGGER trg_calc_total
FOR INSERT OR UPDATE OR DELETE ON order_items
COMPOUND TRIGGER
    v_order_id NUMBER;

    AFTER EACH ROW IS
    BEGIN
        v_order_id := COALESCE(:NEW.order_id, :OLD.order_id);
    END AFTER EACH ROW;

    AFTER STATEMENT IS
    BEGIN
        UPDATE orders
        SET total_amount = (
            SELECT NVL(SUM(quantity * unit_price), 0)
            FROM order_items
            WHERE order_id = v_order_id
        )
        WHERE order_id = v_order_id;
    END AFTER STATEMENT;

END trg_calc_total;
/

CREATE OR REPLACE TRIGGER trg_default_customer_role
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF :NEW.role IS NULL THEN
        :NEW.role := 'Customer';
    END IF;
    IF :NEW.created_date IS NULL THEN
        :NEW.created_date := SYSDATE;
    END IF;
END;
/


-- ============================================================
-- STEP 5: CREATE PROCEDURES
-- ============================================================

CREATE OR REPLACE PROCEDURE proc_register_customer (
    p_username  IN VARCHAR2,
    p_password  IN VARCHAR2,
    p_full_name IN VARCHAR2,
    p_email     IN VARCHAR2,
    p_phone     IN VARCHAR2,
    p_address   IN VARCHAR2
)
AS
    v_user_id     NUMBER;
    v_count       NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM customers WHERE email = p_email;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Email already registered!');
    END IF;

    SELECT COUNT(*) INTO v_count FROM users WHERE username = p_username;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Username already taken!');
    END IF;

    INSERT INTO users (username, password, role, created_date)
    VALUES (p_username, p_password, 'Customer', SYSDATE)
    RETURNING user_id INTO v_user_id;

    INSERT INTO customers (user_id, full_name, email, phone, address, created_date)
    VALUES (v_user_id, p_full_name, p_email, p_phone, p_address, SYSDATE);

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Registration successful! User ID: ' || v_user_id);
    DBMS_OUTPUT.PUT_LINE('Role assigned: Customer');

EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;
/

CREATE OR REPLACE PROCEDURE proc_create_db_user (
    p_username IN VARCHAR2,
    p_password IN VARCHAR2
)
AS
BEGIN
    EXECUTE IMMEDIATE 'CREATE USER ' || p_username
                   || ' IDENTIFIED BY "' || p_password || '"';

    EXECUTE IMMEDIATE 'GRANT role_customer TO ' || p_username;
    EXECUTE IMMEDIATE 'GRANT CREATE SESSION TO ' || p_username;

    DBMS_OUTPUT.PUT_LINE('DB user created: ' || p_username || ' with role_customer');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Error creating DB user: ' || SQLERRM);
END;
/


-- ============================================================
-- STEP 6: CREATE ROLES
-- ============================================================

CREATE ROLE role_admin;
CREATE ROLE role_sale;
CREATE ROLE role_customer;

-- ============================================================
-- STEP 7: GRANT PRIVILEGES TO ROLES
-- ============================================================

GRANT CREATE SESSION TO role_admin;
GRANT CREATE USER TO role_admin;
GRANT DROP USER TO role_admin;
GRANT CREATE ROLE TO role_admin;
GRANT DROP ANY ROLE TO role_admin;
GRANT GRANT ANY ROLE TO role_admin;

GRANT SELECT, INSERT, UPDATE, DELETE ON SYSTEM.products TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON SYSTEM.users TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON SYSTEM.customers TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON SYSTEM.orders TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON SYSTEM.order_items TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON SYSTEM.sales_log TO role_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON SYSTEM.product_variants TO role_admin;

GRANT CREATE SESSION TO role_sale;
GRANT SELECT, INSERT, UPDATE ON SYSTEM.orders TO role_sale;
GRANT SELECT, INSERT ON SYSTEM.order_items TO role_sale;
GRANT SELECT ON SYSTEM.products TO role_sale;
GRANT SELECT ON SYSTEM.customers TO role_sale;
GRANT SELECT ON SYSTEM.v_sales_report TO role_sale;
GRANT SELECT ON SYSTEM.v_product_stock TO role_sale;

GRANT CREATE SESSION TO role_customer;
GRANT SELECT ON SYSTEM.products TO role_customer;
GRANT SELECT ON SYSTEM.v_product_stock TO role_customer;
GRANT SELECT ON SYSTEM.customers TO role_customer;
GRANT SELECT ON SYSTEM.orders TO role_customer;
GRANT INSERT ON SYSTEM.customers TO role_customer;



-- ============================================================
-- STEP 8: CREATE USER ACCOUNTS AND ASSIGN ROLES
-- ============================================================

CREATE USER Th34n IDENTIFIED BY "Th34n90s";
GRANT role_admin TO Th34n;
GRANT CREATE SESSION TO Th34n;

CREATE USER Sengmeng IDENTIFIED BY "S3ngm3ng";
GRANT role_sale TO Sengmeng;
GRANT CREATE SESSION TO Sengmeng;

ALTER USER Th34n IDENTIFIED BY "Th34n90s";
ALTER USER Sengmeng IDENTIFIED BY "S3ngm3ng";

GRANT role_admin TO Th34n;
GRANT role_sale TO Sengmeng;
GRANT CREATE SESSION TO Th34n;
GRANT CREATE SESSION TO Sengmeng;


-- ============================================================
-- STEP 9: INSERT SAMPLE DATA
-- ============================================================

INSERT INTO products (product_name, category, size_, color, price, stock_qty)
VALUES ('Classic White Shirt',  'Shirt', 'M',  'White',  25.99, 50);

INSERT INTO products (product_name, category, size_, color, price, stock_qty)
VALUES ('Slim Fit Jeans',        'Pants', 'L',  'Blue',   45.99, 30);

INSERT INTO products (product_name, category, size_, color, price, stock_qty)
VALUES ('Polo T-Shirt',          'Shirt', 'XL', 'Black',  18.50, 100);

INSERT INTO products (product_name, category, size_, color, price, stock_qty)
VALUES ('Formal Trousers',       'Pants', 'M',  'Grey',   55.00, 20);

INSERT INTO products (product_name, category, size_, color, price, stock_qty)
VALUES ('Leather Belt',          'Accessories', NULL, 'Brown', 12.99, 40);

INSERT INTO users (username, password, role)
VALUES ('Th34n', 'Th34n90s', 'Admin');

INSERT INTO users (username, password, role)
VALUES ('Sengmeng', 'S3ngm3ng', 'Sale');

COMMIT;


-- ============================================================
-- STEP 10: TEST REGISTRATION
-- ============================================================

SET SERVEROUTPUT ON;

BEGIN
    proc_register_customer(
        p_username  => 'Heng',
        p_password  => '123456',
        p_full_name => 'Bunheng',
        p_email     => 'heng@email.com',
        p_phone     => '012-345-678',
        p_address   => 'Phnom Penh, Cambodia'
    );
END;
/

SELECT u.user_id, u.username, u.role, c.full_name, c.email
FROM users u
JOIN customers c ON c.user_id = u.user_id
WHERE u.username = 'Heng';

SELECT * FROM v_registered_customers;

SELECT * FROM v_product_stock;


-- ============================================================
-- STEP 11: ENCRYPTION / PASSWORD HASHING
-- ============================================================

-- Add a column to store hashed passwords
ALTER TABLE users ADD password_hash VARCHAR2(64);

-- Convert existing plain passwords to SHA-256 hash values
UPDATE users
SET password_hash = STANDARD_HASH(password, 'SHA256');

COMMIT;

-- Verify plain password vs hashed password
SELECT 
    username,
    password AS plain_password,
    password_hash AS hashed_password,
    role
FROM users;

-- Demonstrate that hashing is one-way
SELECT 
    '123456' AS plain_password,
    STANDARD_HASH('123456', 'SHA256') AS hashed_password
FROM dual;

-- Demonstrate that a small change creates a different hash
SELECT 
    '123457' AS plain_password,
    STANDARD_HASH('123457', 'SHA256') AS hashed_password
FROM dual;


UPDATE users
SET password_hash = STANDARD_HASH(password, 'SHA256');

COMMIT;

SELECT 
    username,
    password AS plain_password,
    password_hash AS hashed_password,
    role
FROM users;

-- Test

CREATE USER mens_store_test IDENTIFIED BY "Test123";

GRANT CREATE SESSION TO mens_store_test;
GRANT CREATE TABLE TO mens_store_test;
GRANT CREATE VIEW TO mens_store_test;
GRANT CREATE SEQUENCE TO mens_store_test;
GRANT CREATE TRIGGER TO mens_store_test;
GRANT CREATE PROCEDURE TO mens_store_test;
GRANT UNLIMITED TABLESPACE TO mens_store_test;

-- Verify restore

SELECT username
FROM dba_users
WHERE username = 'MENS_STORE_TEST';
SELECT name FROM v$services;

SELECT owner, table_name
FROM all_tables
WHERE owner IN ('SYSTEM', 'MENS_STORE_TEST')
AND table_name IN ('PRODUCTS', 'USERS', 'CUSTOMERS', 'ORDERS', 'ORDER_ITEMS', 'SALES_LOG')
ORDER BY owner, table_name;

SELECT COUNT(*) FROM SYSTEM.PRODUCTS;
SELECT COUNT(*) FROM SYSTEM.USERS;
SELECT COUNT(*) FROM SYSTEM.CUSTOMERS;

SELECT COUNT(*) AS product_count FROM SYSTEM.PRODUCTS;
SELECT COUNT(*) AS user_count FROM SYSTEM.USERS;
SELECT COUNT(*) AS customer_count FROM SYSTEM.CUSTOMERS;

-- Backup data
SELECT directory_name, directory_path
FROM dba_directories
WHERE directory_name = 'DATA_PUMP_DIR';



