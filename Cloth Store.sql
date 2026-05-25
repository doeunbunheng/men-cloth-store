-- ============================================================
--  MEN'S CLOTHING STORE DATABASE  --  Oracle 21c XE
--  Roles: Admin | Sale | Customer
--  Author: Th34n
-- ============================================================

-- ============================================================
-- STEP 0: Connect to PDB first (run manually in SQL Developer)
-- ============================================================
-- ALTER SESSION SET CONTAINER = XEPDB1;
-- SHOW USER;   <-- note your schema name, replace "Th34n" below

-- ============================================================
-- STEP 1: CREATE TABLES
-- ============================================================

-- 1. PRODUCTS
CREATE TABLE products (
    product_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_name VARCHAR2(100)  NOT NULL,
    category     VARCHAR2(50),
    size_        VARCHAR2(10),
    color        VARCHAR2(30),
    price        NUMBER(10,2)   NOT NULL,
    stock_qty    NUMBER         DEFAULT 0
);

-- 2. USERS  (Admin, Sale, Customer staff accounts)
CREATE TABLE users (
    user_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username     VARCHAR2(50)   UNIQUE NOT NULL,
    password     VARCHAR2(200)  NOT NULL,
    role         VARCHAR2(20)   CHECK (role IN ('Admin','Sale','Customer')),
    created_date DATE           DEFAULT SYSDATE
);

-- 3. CUSTOMERS  (linked to a user account via user_id)
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

-- 4. ORDERS
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

-- 5. ORDER_ITEMS
CREATE TABLE order_items (
    item_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id     NUMBER         NOT NULL,
    product_id   NUMBER         NOT NULL,
    quantity     NUMBER         NOT NULL,
    unit_price   NUMBER(10,2)   NOT NULL,
    CONSTRAINT fk_item_order   FOREIGN KEY (order_id)   REFERENCES orders(order_id),
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- 6. SALES_LOG  (auto-filled by trigger)
CREATE TABLE sales_log (
    log_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id     NUMBER,
    user_id      NUMBER,
    action       VARCHAR2(50),
    log_date     DATE           DEFAULT SYSDATE,
    CONSTRAINT fk_log_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
);


-- ============================================================
-- STEP 2: CREATE VIEWS
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

-- Verify it works
SELECT * FROM v_sales_report;

-- Product stock (sorted lowest first to spot items needing restock)
CREATE OR REPLACE VIEW v_product_stock AS
SELECT product_id, product_name, category, size_, color, price, stock_qty
FROM products
ORDER BY stock_qty ASC;

-- Order detail (itemised lines)
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

-- Registered customers (FIXED: joins on user_id, not created_date)
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
-- STEP 3: CREATE TRIGGERS
-- ============================================================

-- Trigger 1: Auto-reduce stock when an order item is inserted
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



-- Trigger 2: Auto-log every new order into SALES_LOG
CREATE OR REPLACE TRIGGER trg_sales_log
AFTER INSERT ON orders
FOR EACH ROW
BEGIN
    INSERT INTO sales_log (order_id, user_id, action, log_date)
    VALUES (:NEW.order_id, :NEW.user_id, 'ORDER_CREATED', SYSDATE);
END;
/


-- Drop the broken trigger first
-- DROP TRIGGER trg_sync_product_stock;

-- Recreate as compound trigger (fixes ORA-04091)
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




-- Trigger 3: Auto-calculate total_amount (FIXED: compound trigger avoids ORA-04091)
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

-- Trigger 4: Default role to 'Customer' when none is provided
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
-- STEP 4: CREATE PROCEDURES
-- ============================================================

-- Procedure 1: Register a new customer (auto-assigns Customer role)
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
    -- Check duplicate email
    SELECT COUNT(*) INTO v_count FROM customers WHERE email = p_email;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Email already registered!');
    END IF;

    -- Check duplicate username
    SELECT COUNT(*) INTO v_count FROM users WHERE username = p_username;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Username already taken!');
    END IF;

    -- Insert into USERS with role = Customer
    INSERT INTO users (username, password, role, created_date)
    VALUES (p_username, p_password, 'Customer', SYSDATE)
    RETURNING user_id INTO v_user_id;

    -- Insert into CUSTOMERS linked by user_id (FIXED)
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

-- Procedure 2: Admin creates an Oracle DB login for a new user
--              (FIXED: grants role_customer, not the old "Customer")
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


CREATE OR REPLACE VIEW v_product_stock AS
SELECT product_id, product_name, category, size_, color, 
       price, stock_qty, image_url
FROM products
ORDER BY stock_qty ASC;







-- ============================================================
-- STEP 5: CREATE ROLES
-- ============================================================

CREATE ROLE role_admin;
CREATE ROLE role_sale;
CREATE ROLE role_customer;


-- ============================================================
-- STEP 6: GRANT PRIVILEGES TO ROLES
-- ============================================================

-- Admin: full control + can manage users and roles
GRANT ALL PRIVILEGES  TO role_admin;
GRANT CREATE USER     TO role_admin;
GRANT DROP USER       TO role_admin;
GRANT GRANT ANY ROLE  TO role_admin;
GRANT CREATE ROLE     TO role_admin;
GRANT DROP ANY ROLE   TO role_admin;

-- Sale: can process orders and view reports
-- Schema: SYSTEM (confirmed by SHOW USER)
GRANT CREATE SESSION                              TO role_sale;
GRANT SELECT, INSERT, UPDATE ON SYSTEM.orders      TO role_sale;
GRANT SELECT, INSERT         ON SYSTEM.order_items TO role_sale;
GRANT SELECT                 ON SYSTEM.products    TO role_sale;
GRANT SELECT                 ON SYSTEM.customers   TO role_sale;
GRANT SELECT                 ON SYSTEM.v_sales_report  TO role_sale;
GRANT SELECT                 ON SYSTEM.v_product_stock TO role_sale;

-- Customer: can browse products and view own orders
-- Schema: SYSTEM (confirmed by SHOW USER)
GRANT CREATE SESSION                              TO role_customer;
GRANT SELECT         ON SYSTEM.products            TO role_customer;
GRANT SELECT         ON SYSTEM.v_product_stock     TO role_customer;
GRANT SELECT         ON SYSTEM.customers           TO role_customer;
GRANT SELECT         ON SYSTEM.orders              TO role_customer;
GRANT INSERT         ON SYSTEM.customers           TO role_customer;


-- ============================================================
-- STEP 7: CREATE USER ACCOUNTS & ASSIGN ROLES
-- ============================================================

-- Admin account
CREATE USER Th34n IDENTIFIED BY "Th34n90s";
GRANT role_admin     TO Th34n;
GRANT CREATE SESSION TO Th34n;

-- Sale staff account (example)
CREATE USER Sengmeng IDENTIFIED BY "S3ngm3ng";
GRANT role_sale      TO Sengmeng;
GRANT CREATE SESSION TO Sengmeng;


-- ============================================================
-- STEP 8: INSERT SAMPLE DATA (for testing)
-- ============================================================

-- Products
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

COMMIT;


-- ============================================================
-- STEP 9: TEST REGISTRATION
-- ============================================================

-- Step 1: Enable output
SET SERVEROUTPUT ON;

-- Step 2: Call the procedure using BEGIN...END (not EXEC for multi-line)
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

-- Step 3: Verify the customer was registered
SELECT u.user_id, u.username, u.role, c.full_name, c.email
FROM users u
JOIN customers c ON c.user_id = u.user_id
WHERE u.username = 'Heng';

-- Step 4: View all registered customers
SELECT * FROM v_registered_customers;

-- View all products
SELECT * FROM v_product_stock;


-- ============================================================
-- STEP 10: BACKUP COMMAND (run in terminal, not SQL Developer)
-- ============================================================
-- expdp Th34n/Th34n90s@XEPDB1 FULL=YES \
--   DIRECTORY=DATA_PUMP_DIR \
--   DUMPFILE=mens_store_backup.dmp \
--   LOGFILE=mens_store_backup.log

-- ============================================================
-- END OF SCRIPT
-- ============================================================





SELECT user_id, username, password, role FROM users;


CREATE USER Th34n IDENTIFIED BY "Th34n90s";

-- Check exact username and password stored
SELECT username, password, role FROM users WHERE UPPER(username) = 'Th34n';


-- Insert Admin user
INSERT INTO users (username, password, role)
VALUES ('Th34n', 'Th34n90s', 'Admin');

-- Insert Sale user
INSERT INTO users (username, password, role)
VALUES ('Sengmeng', 'S3ngm3ng', 'Sale');

COMMIT;



-- ============================================================
-- ADD PRODUCT VARIANTS SUPPORT
-- Run this in SQL Developer
-- ============================================================

-- Drop table product_variants;

-- Create variants table in XEPDB1
CREATE TABLE product_variants (
    variant_id  NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id  NUMBER NOT NULL,
    size_       VARCHAR2(10),
    color       VARCHAR2(30),
    stock_qty   NUMBER DEFAULT 0,
    CONSTRAINT fk_var_product2 FOREIGN KEY (product_id)
    REFERENCES products(product_id)
);

-- Add columns to order_items (skip if already added)
ALTER TABLE order_items ADD selected_size  VARCHAR2(10);
ALTER TABLE order_items ADD selected_color VARCHAR2(30);

-- Check your product IDs
SELECT product_id, product_name FROM products;

COMMIT;

-- Step 4: Verify
SELECT v.variant_id, p.product_name, v.size_, v.color, v.stock_qty
FROM product_variants v
JOIN products p ON v.product_id = p.product_id;


-- Grant access so Django can see it
GRANT ALL ON SYSTEM.product_variants TO PUBLIC;

-- Also create a synonym so it's accessible without prefix
CREATE OR REPLACE SYNONYM product_variants FOR SYSTEM.product_variants;

COMMIT;

-- Check what PDB you're connected to right now
SELECT SYS_CONTEXT('USERENV', 'CON_NAME') FROM dual;

-- Check available service names
SELECT name FROM v$services;





-- Step 1: Add image_url column to products table
ALTER TABLE products ADD image_url VARCHAR2(500);

-- Step 2: Verify column was added
SELECT column_name FROM user_columns WHERE table_name = 'PRODUCTS';

-- Step 3: Recreate view to include image_url
CREATE OR REPLACE VIEW v_product_stock AS
SELECT product_id, product_name, category, size_,
       color, price, stock_qty, image_url
FROM products
ORDER BY stock_qty ASC;

-- Step 4: Check current products
SELECT product_name, image_url FROM products;

COMMIT;


-- Add columns if missing (safe to run - will error if already exists, that's ok)
ALTER TABLE order_items ADD selected_size  VARCHAR2(10);
ALTER TABLE order_items ADD selected_color VARCHAR2(30);
COMMIT;


-- Create daily backup job at midnight
BEGIN
    DBMS_SCHEDULER.CREATE_JOB(
        job_name        => 'MENS_STORE_DAILY_BACKUP',
        job_type        => 'PLSQL_BLOCK',
        job_action      => '
            BEGIN
                -- Log backup time to a table
                INSERT INTO sales_log (order_id, user_id, action, log_date)
                VALUES (NULL, NULL, ''AUTO_BACKUP_DAILY'', SYSDATE);
                COMMIT;
            END;
        ',
        start_date      => SYSTIMESTAMP,
        repeat_interval => 'FREQ=DAILY; BYHOUR=0; BYMINUTE=0',
        enabled         => TRUE,
        comments        => 'Daily auto backup log for Men''s Store'
    );
END;
/

-- Create hourly backup job
BEGIN
    DBMS_SCHEDULER.CREATE_JOB(
        job_name        => 'MENS_STORE_HOURLY_BACKUP',
        job_type        => 'PLSQL_BLOCK',
        job_action      => '
            BEGIN
                INSERT INTO sales_log (order_id, user_id, action, log_date)
                VALUES (NULL, NULL, ''AUTO_BACKUP_HOURLY'', SYSDATE);
                COMMIT;
            END;
        ',
        start_date      => SYSTIMESTAMP,
        repeat_interval => 'FREQ=HOURLY; BYMINUTE=0',
        enabled         => TRUE,
        comments        => 'Hourly auto backup log for Men''s Store'
    );
END;
/

-- Verify jobs created
SELECT job_name, repeat_interval, enabled, last_start_date
FROM user_scheduler_jobs;



-- Update all products stock_qty to match sum of their variants
UPDATE products p
SET stock_qty = (
    SELECT NVL(SUM(v.stock_qty), 0)
    FROM product_variants v
    WHERE v.product_id = p.product_id
);

COMMIT;

-- Verify
SELECT p.product_name, p.stock_qty, 
       NVL(SUM(v.stock_qty),0) AS variant_total
FROM products p
LEFT JOIN product_variants v ON v.product_id = p.product_id
GROUP BY p.product_id, p.product_name, p.stock_qty
ORDER BY p.product_id;












SELECT table_name FROM user_tables WHERE table_name = 'PRODUCT_VARIANTS';


SELECT table_name FROM user_tables ORDER BY table_name;






-- Check which user owns product_variants
SELECT owner, table_name 
FROM all_tables 
WHERE table_name = 'PRODUCT_VARIANTS';

SELECT SYS_CONTEXT('USERENV', 'SESSION_USER') FROM dual;




SELECT product_id, product_name FROM products ORDER BY product_id;


-- Switch to correct container
ALTER SESSION SET CONTAINER = XEPDB1;

-- Verify you're now in XEPDB1
SELECT SYS_CONTEXT('USERENV', 'CON_NAME') FROM dual;




-- Step 1: Switch container first
ALTER SESSION SET CONTAINER = XEPDB1;

-- Step 2: Check if ORDER_ITEMS exists
SELECT table_name FROM user_tables WHERE table_name = 'ORDER_ITEMS';

-- Step 3: Check columns (correct view name)
-- Check ORDER_ITEMS columns
SELECT column_name, data_type
FROM user_tab_columns
WHERE table_name = 'ORDER_ITEMS'
ORDER BY column_id;

SELECT table_name FROM user_tables ORDER BY table_name;

ALTER SESSION SET CONTAINER = XEPDB1;

SELECT * FROM Customers;




SELECT job_name, repeat_interval, enabled, last_start_date
FROM user_scheduler_jobs;





SELECT o.order_id, o.customer_id, o.user_id, 
       c.full_name AS customer,
       u.username  AS placed_by
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN users u     ON o.user_id     = u.user_id
ORDER BY o.order_id DESC;

