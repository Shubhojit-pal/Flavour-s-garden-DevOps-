CREATE TABLE tblOutlet (
    Outlet_ID VARCHAR(50) PRIMARY KEY,
    Outlet_Name VARCHAR(100) NOT NULL,
    Outlet_Address VARCHAR(255)
);

CREATE TABLE tblMenu_Categories (
    Menu_Category_ID VARCHAR(50) PRIMARY KEY,
    Category_Name VARCHAR(100) NOT NULL
);

CREATE TABLE tblConfiguration (
    SGST DECIMAL(5,4) DEFAULT 0.025,
    CGST DECIMAL(5,4) DEFAULT 0.025,
    Change_DateTime TIMESTAMP PRIMARY KEY DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tblReference (
    Outlet_ID VARCHAR(50),
    Menu_Category_ID VARCHAR(50),
    Ref_Key VARCHAR(100),
    FOREIGN KEY (Outlet_ID) REFERENCES tblOutlet(Outlet_ID),
    FOREIGN KEY (Menu_Category_ID) REFERENCES tblMenu_Categories(Menu_Category_ID)
);

CREATE TABLE tblConsumer (
    Consumer_ID VARCHAR(50) PRIMARY KEY,
    First_Name VARCHAR(50),
    Last_Name VARCHAR(50),
    Ph_No BIGINT,
    Email VARCHAR(100),
    Password_Hash VARCHAR(255),
    Last_Logged_In TIMESTAMP,
    Default_Address VARCHAR(255),
    Default_Pin INT,
    Del_Address_1 VARCHAR(255),
    Del_Pin INT
);

CREATE TABLE tblAddress (
    Consumer_ID VARCHAR(50) PRIMARY KEY,
    Street VARCHAR(100),
    City VARCHAR(50),
    Landmark VARCHAR(100),
    Pin_Code INT,
    FOREIGN KEY (Consumer_ID) REFERENCES tblConsumer(Consumer_ID)
);

CREATE TABLE tblEmployees (
    Employee_ID VARCHAR(50) PRIMARY KEY,
    First_Name VARCHAR(50),
    Last_Name VARCHAR(50),
    Role VARCHAR(50),
    Address VARCHAR(255),
    Outlet_ID VARCHAR(50),
    Date_of_Joining DATE,
    Is_Active BOOLEAN,
    Contact_No BIGINT,
    Email VARCHAR(100),
    password VARCHAR(255),
    FOREIGN KEY (Outlet_ID) REFERENCES tblOutlet(Outlet_ID)
);

CREATE TABLE tblInventory (
    Item_ID VARCHAR(50) PRIMARY KEY,
    Outlet_ID VARCHAR(50),
    Ingredient_Name VARCHAR(100),
    Current_Qty DECIMAL(10,2),
    Unit_of_Measurement VARCHAR(20),
    Min_Stock_Level DECIMAL(10,2),
    Reorder_Level DECIMAL(10,2),
    Priority VARCHAR(20),
    Last_Updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Outlet_ID) REFERENCES tblOutlet(Outlet_ID)
);

CREATE TABLE tblRecipe (
    Recipe_ID VARCHAR(50),
    SL_no INT,
    Product_ID VARCHAR(50),
    Item_ID VARCHAR(50),
    Item_Name VARCHAR(255),
    Unit_measure VARCHAR(50),
    Unit_Qty DECIMAL(10, 2),
    PRIMARY KEY (Recipe_ID, SL_no)
);

CREATE TABLE tblProduct (
    Product_ID VARCHAR(50) PRIMARY KEY,
    Product_Name VARCHAR(100),
    Menu_Category_ID VARCHAR(50),
    Price_Per_Unit DECIMAL(10,2),
    Image_Url TEXT,
    Product_Description TEXT,
    Allergen TEXT,
    Ref_Key VARCHAR(50),
    Recipe_ID VARCHAR(255),
    Is_Recommended VARCHAR(50),
    Is_Veg VARCHAR(50),
    FOREIGN KEY (Menu_Category_ID) REFERENCES tblMenu_Categories(Menu_Category_ID)
);

CREATE TABLE tblSales_Order_Header (
    Sales_Order_ID VARCHAR(50) PRIMARY KEY,
    Order_Date DATE,
    Consumer_ID VARCHAR(50),
    Outlet_ID VARCHAR(50),
    Order_type VARCHAR(50),
    Total_Amount DECIMAL(10,2),
    SGST DECIMAL(10,2),
    CGST DECIMAL(10,2),
    Discount DECIMAL(10,2),
    Net_Amount DECIMAL(10,2),
    Sales_Order_Status VARCHAR(50),
    FOREIGN KEY (Consumer_ID) REFERENCES tblConsumer(Consumer_ID),
    FOREIGN KEY (Outlet_ID) REFERENCES tblOutlet(Outlet_ID)
);

CREATE TABLE tblSales_Order_Details (
    SL_NO INT AUTO_INCREMENT PRIMARY KEY,
    Sales_Order_ID VARCHAR(50),
    Product_ID VARCHAR(50),
    Qty INT,
    Amount DECIMAL(10,2),
    FOREIGN KEY (Sales_Order_ID) REFERENCES tblSales_Order_Header(Sales_Order_ID),
    FOREIGN KEY (Product_ID) REFERENCES tblProduct(Product_ID)
);

CREATE TABLE tblSales_Payment (
    Transaction_id VARCHAR(50) PRIMARY KEY,
    User_id VARCHAR(50),
    Sales_order_id VARCHAR(50),
    Mode_of_Payment VARCHAR(50),
    Payment_Amount DECIMAL(10,2),
    Status VARCHAR(50),
    Payment_date DATE,
    FOREIGN KEY (User_id) REFERENCES tblConsumer(Consumer_ID),
    FOREIGN KEY (Sales_order_id) REFERENCES tblSales_Order_Header(Sales_Order_ID)
);

CREATE TABLE tblDelivery (
    Delivery_ID VARCHAR(50) PRIMARY KEY,
    Sales_Order_ID VARCHAR(50),
    FOREIGN KEY (Sales_Order_ID) REFERENCES tblSales_Order_Header(Sales_Order_ID)
);

CREATE TABLE tblVendor_Details (
    Vendor_ID VARCHAR(50) PRIMARY KEY,
    Vendor_Address VARCHAR(255),
    Vendor_Type VARCHAR(50),
    Vendor_Contact BIGINT,
    Vendor_GST_No VARCHAR(50)
);

CREATE TABLE tblPurchase_Order_HDR (
    PO_ID VARCHAR(50) PRIMARY KEY,
    Purchase_Order_Date DATE NOT NULL,
    Payment_Terms VARCHAR(100),
    Vendor_ID VARCHAR(50),
    Delivery_Date DATE,
    Total_Amount DECIMAL(10,2),
    SGST DECIMAL(10,2),
    CGST DECIMAL(10,2),
    Discount DECIMAL(10,2),
    Net_Amount DECIMAL(10,2),
    Status VARCHAR(50),
    FOREIGN KEY (Vendor_ID) REFERENCES tblVendor_Details(Vendor_ID)
);

CREATE TABLE tblPurchase_Order_Details (
    PO_ID VARCHAR(50),
    SL_NO INT,
    Item_ID VARCHAR(50),
    Outlet_ID VARCHAR(50),
    Qty INT,
    Unit_price DECIMAL(10,2),
    Total_Amount DECIMAL(10,2),
    Unit_Measure VARCHAR(10),
    PRIMARY KEY (PO_ID, SL_NO),
    FOREIGN KEY (PO_ID) REFERENCES tblPurchase_Order_HDR(PO_ID),
    FOREIGN KEY (Item_ID) REFERENCES tblInventory(Item_ID),
    FOREIGN KEY (Outlet_ID) REFERENCES tblOutlet(Outlet_ID)
);

CREATE TABLE tblGRN (
    Order_Date DATE,
    PO_ID VARCHAR(50),
    Vendor_ID VARCHAR(50),
    Item_ID VARCHAR(50),
    Item_Name VARCHAR(255),
    Ordered_Qty INT,
    Received_Qty INT,
    Unit_measure VARCHAR(50),
    PRIMARY KEY (PO_ID, Item_ID),
    CONSTRAINT fk_grn_po FOREIGN KEY (PO_ID) REFERENCES tblPurchase_Order_HDR(PO_ID),
    CONSTRAINT fk_grn_vendor FOREIGN KEY (Vendor_ID) REFERENCES tblVendor_Details(Vendor_ID)
);

CREATE TABLE tblStockLog (
    Sales_Order_ID VARCHAR(50),
    Product_ID VARCHAR(50),
    Product_Qty DECIMAL(10, 2),
    Recipe_ID VARCHAR(50),
    Item_ID VARCHAR(50),
    Unit_Qty DECIMAL(10, 2),
    Unit_measure VARCHAR(50),
    Total_Qty DECIMAL(12, 2) AS (Product_Qty * Unit_Qty) STORED
);

CREATE TABLE tblPurchase_Payment (
    Invoice_No VARCHAR(50) PRIMARY KEY,
    PO_ID VARCHAR(50),
    GRN_No VARCHAR(50),
    Payment_Terms VARCHAR(100),
    Payment_Amount DECIMAL(10,2),
    Status VARCHAR(50),
    FOREIGN KEY (PO_ID) REFERENCES tblPurchase_Order_HDR(PO_ID)
);

CREATE TABLE tblRequisition (
    Req_No VARCHAR(50) PRIMARY KEY,
    Req_Date DATE NOT NULL,
    Item VARCHAR(100) NOT NULL,
    Qty INT NOT NULL,
    Outlet_ID VARCHAR(50),
    Req_Name VARCHAR(100), -- Person/Department requesting
    FOREIGN KEY (Outlet_ID) REFERENCES tblOutlet(Outlet_ID)
);

CREATE TABLE tblIssue (
    Issue_No VARCHAR(50) PRIMARY KEY,
    Issue_Date DATE NOT NULL,
    Req_No VARCHAR(50),      -- Link to the original requisition
    Req_Date DATE,
    Item VARCHAR(100),
    Qty INT,                 -- Original requested quantity
    Del_Qty INT,             -- Actual quantity delivered
    Outlet_ID VARCHAR(50),
    Issue_Name VARCHAR(100), -- Person issuing the stock
    FOREIGN KEY (Outlet_ID) REFERENCES tblOutlet(Outlet_ID),
    FOREIGN KEY (Req_No) REFERENCES tblRequisition(Req_No) 
);


-- 1. tblOutlet
INSERT INTO tblOutlet VALUES 
('OUT001', 'Downtown Garden', '123 Main St, Central'),
('OUT002', 'Lakeside Bistro', '45 North Shore, Westside'),
('OUT003', 'Hills Cafe', '89 Mountain Road, Eastview'),
('OUT004', 'Airport Plaza', 'Terminal 2, International'),
('OUT005', 'Beachside Grill', '10 Ocean Drive, South'),
('OUT006', 'Corporate Hub', 'Floor 1, Tech Park'),
('OUT007', 'Old Town Kitchen', '22 Heritage Lane'),
('OUT008', 'The Rooftop', 'Apex Tower, Floor 40'),
('OUT009', 'Garden Express', 'Subway Mall Unit 4'),
('OUT010', 'Family Diner', '56 Residency Road');

-- 2. tblMenu_Categories
INSERT INTO tblMenu_Categories VALUES 
('CAT01', 'Appetizers'), ('CAT02', 'Main Course'), ('CAT03', 'Desserts'),
('CAT04', 'Beverages'), ('CAT05', 'Breakfast'), ('CAT06', 'Salads'),
('CAT07', 'Soups'), ('CAT08', 'Pizzas'), ('CAT09', 'Burgers'), ('CAT10', 'Pasta');

-- 3. tblConfiguration
INSERT INTO tblConfiguration (SGST, CGST, Change_DateTime) VALUES 
(0.0250, 0.0250, '2025-01-01 10:00:00'), (0.0250, 0.0250, '2025-02-01 10:00:00'),
(0.0300, 0.0300, '2025-03-01 10:00:00'), (0.0300, 0.0300, '2025-04-01 10:00:00'),
(0.0250, 0.0250, '2025-05-01 10:00:00'), (0.0250, 0.0250, '2025-06-01 10:00:00'),
(0.0250, 0.0250, '2025-07-01 10:00:00'), (0.0250, 0.0250, '2025-08-01 10:00:00'),
(0.0250, 0.0250, '2025-09-01 10:00:00'), (0.0250, 0.0250, '2025-10-01 10:00:00');

-- 4. tblVendor_Details
INSERT INTO tblVendor_Details VALUES 
('VEND01', 'Fresh Farms, NY', 'vegetable', 9876543210, 'GSTIN001'),
('VEND02', 'Global Grocers', 'grocery', 9876543211, 'GSTIN002'),
('VEND03', 'Meat Masters', 'poultry', 9876543212, 'GSTIN003'),
('VEND04', 'Dairy Delights', 'dairy', 9876543213, 'GSTIN004'),
('VEND05', 'Spice Route', 'spices', 9876543214, 'GSTIN005'),
('VEND06', 'Baker Choice', 'bakery', 9876543215, 'GSTIN006'),
('VEND07', 'Ocean Catch', 'seafood', 9876543216, 'GSTIN007'),
('VEND08', 'Agro Fresh', 'vegetable', 9876543217, 'GSTIN008'),
('VEND09', 'Clean Sip Co.', 'beverages', 9876543218, 'GSTIN009'),
('VEND10', 'Pack & Go', 'packaging', 9876543219, 'GSTIN010');

-- 5. tblConsumer
INSERT INTO tblConsumer VALUES 
('C101', 'John', 'Doe', 9000000001, 'john@mail.com', 'hash1', NOW(), '12 Main St', 110001, 'Home', 110001),
('C102', 'Jane', 'Smith', 9000000002, 'jane@mail.com', 'hash2', NOW(), '45 Lake Rd', 110002, 'Office', 110002),
('C103', 'Alice', 'Brown', 9000000003, 'alice@mail.com', 'hash3', NOW(), '89 Hill St', 110003, 'Gym', 110003),
('C104', 'Bob', 'White', 9000000004, 'bob@mail.com', 'hash4', NOW(), '10 Sea Ln', 110004, 'Home', 110004),
('C105', 'Charlie', 'Green', 9000000005, 'charlie@mail.com', 'hash5', NOW(), '22 Old Dr', 110005, 'School', 110005),
('C106', 'David', 'Blue', 9000000006, 'david@mail.com', 'hash6', NOW(), '67 New Rd', 110006, 'Home', 110006),
('C107', 'Eve', 'Black', 9000000007, 'eve@mail.com', 'hash7', NOW(), '34 Park Ave', 110007, 'Work', 110007),
('C108', 'Frank', 'Grey', 9000000008, 'frank@mail.com', 'hash8', NOW(), '12 Sky Bldg', 110008, 'Home', 110008),
('C109', 'Grace', 'Yellow', 9000000009, 'grace@mail.com', 'hash9', NOW(), '90 Mall Way', 110009, 'Shop', 110009),
('C110', 'Henry', 'Pink', 9000000010, 'henry@mail.com', 'hash10', NOW(), '44 Res Rd', 110010, 'Home', 110010);

-- 6. tblEmployees
INSERT INTO tblEmployees VALUES 
('EMP001','Arjun','Mehta','Order Manager','12 Sector B, Salt Lake','OUT001','2024-01-10',1,9876543210,'arjun.m@fg.com','Arjun@2024'),
('EMP002','Priya','Sharma','Inventory Manager','45 Park Street','OUT001','2024-01-15',1,9876543211,'priya.s@fg.com','Priya#123'),
('EMP003','Rohan','Das','Kitchen Staff','89 Lake Road','OUT002','2024-02-01',1,9876543212,'rohan.d@fg.com','Rohan@Pass'),
('EMP005','Vikram','Singh','Kitchen Staff','22 Ballygunge Terrace','OUT003','2024-03-05',1,9876543214,'vikram.s@fg.com','Vikram!789'),
('EMP006','Anjali','Gupta','Inventory Manager','5/1 Gariahat Rd','OUT003','2024-03-20',1,9876543215,'anjali.g@fg.com','Anjali@99'),
('EMP007','Kabir','Khan','Order Manager','77 Shakespeare Sarani','OUT004','2024-04-01',1,9876543216,'kabir.k@fg.com','Kabir#Pass'),
('EMP008','Ishita','Ray','Kitchen Staff','14 New Town, Block C','OUT004','2024-04-10',1,9876543217,'ishita.r@fg.com','Ishita*08'),
('EMP009','Amit','Verma','Inventory Manager','33 Rajarhat Main Rd','OUT005','2024-05-02',1,9876543218,'amit.v@fg.com','Amit@2024'),
('EMP010','Sneha','Paul','Order Manager','9 Topia Rd, Sector 5','OUT005','2024-05-15',0,9876543219,'sneha.p@fg.com','Sneha_123'),
('EMP011','Raj','Malhotra','Staff','7 Hill view','OUT001','2024-06-01',1,9876543220,'raj@fg.com','Raj@789');

-- 7. tblProduct (Disable checks temporarily due to Recipe self-reference logic)
INSERT INTO tblProduct VALUES
('P001', 'Biryani', 'CAT02', 200, NULL, 'Aromatic basmati rice cooked with spices.', 'allergens', 'WBK101CAT02', 'RD-0012', 'Yes', 'Yes'),
('P002', 'Chicken Biryani', 'CAT02', 280, NULL, 'Classic chicken biryani.', 'allergens', 'WBK101CAT02', 'RD-0013', 'No', 'Yes'),
('P003', 'Chowmein', 'CAT02', 180, NULL, 'Stir-fried noodles.', 'allergens', 'WBK102CAT02', 'RD-0014', 'Yes', 'Yes'),
('P004', 'Chicken Chowmein', 'CAT02', 220, NULL, 'Noodles with chicken.', 'allergens', 'WBK102CAT02', 'RD-0015', 'No', 'No'),
('P005', 'Momo Veg', 'CAT01', 150, NULL, 'Dumplings with veg.', 'allergens', 'WBK103CAT01', 'RD-0016', 'Yes', 'Yes'),
('P006', 'Chicken Momo', 'CAT01', 180, NULL, 'Dumplings with chicken.', 'allergens', 'WBK103CAT01', 'RD-0017', 'No', 'Yes'),
('P007', 'Pasta Alfredo', 'CAT10', 250, NULL, 'Creamy pasta.', 'allergens', 'WBK102CAT10', 'RD-0018', 'Yes', 'Yes'),
('P008', 'Pasta Arrabiata', 'CAT10', 240, NULL, 'Spicy pasta.', 'allergens', 'WBK102CAT10', 'RD-0019', 'Yes', 'No'),
('P009', 'Donuts Classic', 'CAT03', 100, NULL, 'Glazed donuts.', 'allergens', 'WBK103CAT03', 'RD-0020', 'Yes', 'Yes'),
('P010', 'Chocolate Donuts', 'CAT03', 120, NULL, 'Rich cocoa donuts.', 'allergens', 'WBK103CAT03', 'RD-0021', 'Yes', 'Yes');

-- 8. tblInventory
INSERT INTO tblInventory VALUES 
('INV01', 'OUT001', 'Wheat Flour', 100.00, 'Kg', 10.00, 20.00, 'High', NOW()),
('INV02', 'OUT001', 'Chicken', 50.00, 'Kg', 5.00, 10.00, 'High', NOW()),
('INV03', 'OUT002', 'Milk', 200.00, 'Ltr', 20.00, 40.00, 'Medium', NOW()),
('INV04', 'OUT002', 'Coffee Beans', 30.00, 'Kg', 2.00, 5.00, 'Medium', NOW()),
('INV05', 'OUT003', 'Tomatoes', 40.00, 'Kg', 5.00, 8.00, 'High', NOW()),
('INV06', 'OUT004', 'Butter', 25.00, 'Kg', 3.00, 6.00, 'High', NOW()),
('INV07', 'OUT005', 'Salt', 15.00, 'Kg', 2.00, 4.00, 'Low', NOW()),
('INV08', 'OUT006', 'Sugar', 50.00, 'Kg', 5.00, 10.00, 'Low', NOW()),
('INV09', 'OUT007', 'Basil', 5.00, 'Kg', 0.50, 1.00, 'Medium', NOW()),
('INV10', 'OUT001', 'Cooking Oil', 80.00, 'Ltr', 10.00, 15.00, 'High', NOW());

-- 9. tblAddress
INSERT INTO tblAddress VALUES 
('C101', '12 Main St', 'Central City', 'Near Clock Tower', 110001),
('C102', '45 Lake Rd', 'Westview', 'Behind Mall', 110002),
('C103', '89 Hill St', 'Eastside', 'Apex Point', 110003),
('C104', '10 Sea Ln', 'Southport', 'Pier 9', 110004),
('C105', '22 Old Dr', 'Historic Dist', 'Old Gate', 110005),
('C106', '67 New Rd', 'Uptown', 'Station Sq', 110006),
('C107', '34 Park Ave', 'Greenland', 'City Park', 110007),
('C108', '12 Sky Bldg', 'Skylake', 'Floor 12', 110008),
('C109', '90 Mall Way', 'Central', 'Unit 4', 110009),
('C110', '44 Res Rd', 'Family Park', 'Near Clinic', 110010);

-- 10. tblSales_Order_Header
INSERT INTO tblSales_Order_Header (
    Sales_Order_ID, 
    Order_Date, 
    Consumer_ID, 
    Outlet_ID, 
    Order_type, 
    Total_Amount, 
    SGST, 
    CGST, 
    Discount, 
    Net_Amount, 
    Sales_Order_Status
) VALUES  
('SOH01', '2025-11-01', 'C101', 'OUT001', 'Dine-in', 100.00, 2.50, 2.50, 5.00, 95.00, 'executed'),
('SOH02', '2025-11-01', 'C102', 'OUT001', 'Delivery', 150.00, 3.75, 3.75, 0.00, 157.50, 'executed'),
('SOH03', '2025-11-02', 'C103', 'OUT002', 'Takeaway', 50.00, 1.25, 1.25, 2.00, 50.50, 'executed'),
('SOH04', '2025-11-02', 'C104', 'OUT003', 'Dine-in', 80.00, 2.00, 2.00, 10.00, 74.00, 'cancelled'),
('SOH05', '2025-11-03', 'C105', 'OUT004', 'Delivery', 200.00, 5.00, 5.00, 20.00, 190.00, 'executed'),
('SOH06', '2025-11-03', 'C106', 'OUT005', 'Dine-in', 120.00, 3.00, 3.00, 0.00, 126.00, 'executed'),
('SOH07', '2025-11-04', 'C107', 'OUT006', 'Takeaway', 45.00, 1.13, 1.13, 5.00, 42.26, 'executed'),
('SOH08', '2025-11-04', 'C108', 'OUT007', 'Dine-in', 300.00, 7.50, 7.50, 30.00, 285.00, 'executed'),
('SOH09', '2025-11-05', 'C109', 'OUT001', 'Delivery', 90.00, 2.25, 2.25, 0.00, 94.50, 'executed'),
('SOH10', '2025-11-05', 'C110', 'OUT002', 'Dine-in', 110.00, 2.75, 2.75, 10.00, 105.50, 'executed');

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE tblPurchase_Payment ;

-- 11. tblSales_Order_Details
INSERT INTO tblSales_Order_Details (Sales_Order_ID, Product_ID, Qty, Amount) VALUES 
('SOH01', 'P001', 2, 30.00), ('SOH01', 'P002', 1, 45.00),
('SOH02', 'P008', 3, 105.00), ('SOH03', 'P004', 4, 48.00),
('SOH05', 'P010', 5, 150.00), ('SOH06', 'P009', 2, 44.00),
('SOH07', 'P007', 3, 30.00), ('SOH08', 'P002', 4, 180.00),
('SOH09', 'P001', 5, 75.00), ('SOH10', 'P003', 2, 50.00);

-- 12. tblPurchase_Order_HDR
INSERT INTO tblPurchase_Order_HDR VALUES 
('PO01', '2025-10-25', 'Net 30', 'VEND01', '2025-10-28', 500.0, 12.5, 12.5, 0.0, 525.0, 'Received'),
('PO02', '2025-10-25', 'COD', 'VEND02', '2025-10-27', 300.0, 7.5, 7.5, 10.0, 305.0, 'Pending'),
('PO03', '2025-10-26', 'Net 15', 'VEND03', '2025-10-30', 800.0, 20.0, 20.0, 50.0, 790.0, 'Received'),
('PO04', '2025-10-26', 'Net 30', 'VEND04', '2025-10-29', 200.0, 5.0, 5.0, 0.0, 210.0, 'Cancelled'),
('PO05', '2025-10-27', 'Immediate', 'VEND05', '2025-10-27', 150.0, 3.75, 3.75, 5.0, 152.5, 'Received'),
('PO06', '2025-10-27', 'Net 30', 'VEND06', '2025-11-01', 400.0, 10.0, 10.0, 0.0, 420.0, 'Pending'),
('PO07', '2025-10-28', 'Net 60', 'VEND07', '2025-11-05', 1000.0, 25.0, 25.0, 100.0, 950.0, 'Pending'),
('PO08', '2025-10-28', 'COD', 'VEND08', '2025-10-29', 600.0, 15.0, 15.0, 20.0, 610.0, 'Received'),
('PO09', '2025-10-29', 'Net 15', 'VEND09', '2025-11-02', 250.0, 6.25, 6.25, 0.0, 262.5, 'Pending'),
('PO10', '2025-10-29', 'Net 30', 'VEND10', '2025-11-01', 100.0, 2.5, 2.5, 5.0, 100.0, 'Received');

-- 13. tblPurchase_Order_Details
INSERT INTO tblPurchase_Order_Details (PO_ID, Outlet_ID, SL_NO, Item_ID, Qty, Unit_price, Unit_Measure) VALUES 
('PO01', 'OUT001', 1, 'INV01', 10, 50.00, 'Kg'), ('PO02', 'OUT002', 1, 'INV03', 20, 15.00, 'Ltr'),
('PO03', 'OUT001', 1, 'INV02', 8, 100.00, 'Kg'), ('PO04', 'OUT004', 1, 'INV06', 5, 40.00, 'Kg'),
('PO05', 'OUT003', 1, 'INV05', 15, 10.00, 'Kg'), ('PO06', 'OUT001', 1, 'INV01', 8, 50.00, 'Kg'),
('PO07', 'OUT001', 1, 'INV10', 10, 100.00, 'Ltr'), ('PO08', 'OUT006', 1, 'INV08', 20, 30.00, 'Kg'),
('PO09', 'OUT002', 1, 'INV04', 5, 50.00, 'Kg'), ('PO10', 'OUT005', 1, 'INV07', 10, 10.00, 'Kg');

-- 14. tblSales_Payment
INSERT INTO tblSales_Payment VALUES 
('TRX001', 'C101', 'SOH01', 'UPI', 95.00, 'successful', '2025-11-01'),
('TRX002', 'C102', 'SOH02', 'Card', 157.50, 'successful', '2025-11-01'),
('TRX003', 'C103', 'SOH03', 'Cash', 50.50, 'successful', '2025-11-02'),
('TRX004', 'C104', 'SOH04', 'UPI', 74.00, 'error', '2025-11-02'),
('TRX005', 'C105', 'SOH05', 'Card', 190.00, 'successful', '2025-11-03'),
('TRX006', 'C106', 'SOH06', 'Cash', 126.00, 'successful', '2025-11-03'),
('TRX007', 'C107', 'SOH07', 'UPI', 42.26, 'successful', '2025-11-04'),
('TRX008', 'C108', 'SOH08', 'Card', 285.00, 'successful', '2025-11-04'),
('TRX009', 'C109', 'SOH09', 'UPI', 94.50, 'successful', '2025-11-05'),
('TRX010', 'C110', 'SOH10', 'Cash', 105.50, 'successful', '2025-11-05');

-- 15. tblDelivery
INSERT INTO tblDelivery VALUES 
('DEL001', 'SOH02'), ('DEL002', 'SOH05'), ('DEL003', 'SOH09'),
('DEL004', 'SOH03'), ('DEL005', 'SOH07');

-- 16. tblPurchase_Payment
INSERT INTO tblPurchase_Payment VALUES 
('IN001', 'PO01', 'GRN01', 'Net 30', 525.00, 'Paid'),
('IN002', 'PO03', 'GRN03', 'Net 15', 790.00, 'Paid'),
('IN003', 'PO05', 'GRN05', 'Immediate', 152.50, 'Paid'),
('IN004', 'PO08', 'GRN08', 'COD', 610.00, 'Paid'),
('IN005', 'PO10', 'GRN10', 'Net 30', 100.00, 'Pending'),
('IN006', 'PO02', 'GRN02', 'COD', 305.00, 'Pending'),
('IN007', 'PO06', 'GRN06', 'Net 30', 420.00, 'Pending'),
('IN008', 'PO07', 'GRN07', 'Net 60', 950.00, 'Pending'),
('IN009', 'PO09', 'GRN09', 'Net 15', 262.50, 'Pending'),
('IN010', 'PO01', 'GRN11', 'Net 30', 50.00, 'Paid');

-- 17. tblReference
INSERT INTO tblReference VALUES 
('OUT001', 'CAT01', 'WBK101CAT01'), ('OUT001', 'CAT02', 'WBK101CAT02'),
('OUT002', 'CAT04', 'WBK101CAT04'), ('OUT002', 'CAT10', 'WBK101CAT10'),
('OUT003', 'CAT07', 'WBK101CAT07'), ('OUT004', 'CAT05', 'WBK101CAT05'),
('OUT005', 'CAT09', 'WBK101CAT09'), ('OUT006', 'CAT04', 'WBK101CAT04'),
('OUT007', 'CAT10', 'WBK101CAT10'), ('OUT001', 'CAT03', 'WBK101CAT03');

-- 18. tblRecipe
INSERT INTO tblRecipe (Recipe_ID, SL_no, Product_ID, Item_ID, Item_Name, Unit_measure, Unit_Qty) VALUES 
('RD-0012', 1, 'P001', 'INV07', 'Salt', 'gm', 2), 
('RD-0012', 2, 'P001', 'INV08', 'Sugar', 'Kg', 5), 
('RD-0012', 3, 'P001', 'INV10', 'Fine Oil', 'Ltr', 5), 
('RD-0012', 4, 'P001', 'INV01', 'Flour', 'Kg', 50), 
('RD-0013', 1, 'P002', 'INV02', 'Chicken', 'Kg', 4), 
('RD-0013', 2, 'P002', 'INV07', 'Salt', 'gm', 3), 
('RD-0014', 1, 'P003', 'INV03', 'Milk', 'Ltr', 6), 
('RD-0016', 1, 'P005', 'INV01', 'Flour', 'Kg', 1), 
('RD-0016', 2, 'P005', 'INV05', 'Tomatoes', 'Kg', 1), 
('RD-0018', 1, 'P007', 'INV03', 'Milk', 'Ltr', 2);

-- 19. tblStockLog
INSERT INTO tblStockLog (Sales_Order_ID, Product_ID, Product_Qty, Recipe_ID, Item_ID, Unit_Qty, Unit_measure) VALUES
('SOH01', 'P001', 2, 'RD-0012', 'INV07', 2, 'gm'),
('SOH01', 'P001', 2, 'RD-0012', 'INV08', 5, 'Kg'),
('SOH01', 'P001', 2, 'RD-0012', 'INV10', 5, 'Ltr'),
('SOH01', 'P001', 2, 'RD-0012', 'INV01', 50, 'Kg'),
('SOH02', 'P008', 3, 'RD-0019', 'INV05', 1, 'Kg'),
('SOH03', 'P004', 4, 'RD-0015', 'INV02', 2, 'Kg'),
('SOH05', 'P010', 5, 'RD-0021', 'INV08', 1, 'Kg'),
('SOH06', 'P009', 2, 'RD-0020', 'INV08', 1, 'Kg'),
('SOH08', 'P002', 4, 'RD-0013', 'INV02', 4, 'Kg'),
('SOH09', 'P001', 5, 'RD-0012', 'INV01', 50, 'Kg');

-- 20.
INSERT INTO tblRequisition (Req_No, Req_Date, Item, Qty, Outlet_ID, Req_Name) VALUES 
('REQ001', '2025-10-20', 'Wheat Flour', 50, 'OUT001', 'Kitchen Dept'),
('REQ002', '2025-10-21', 'Chicken', 20, 'OUT001', 'Head Chef'),
('REQ003', '2025-10-22', 'Milk', 30, 'OUT002', 'Barista Team'),
('REQ004', '2025-10-23', 'Tomatoes', 15, 'OUT003', 'Salad Station'),
('REQ005', '2025-10-24', 'Butter', 10, 'OUT004', 'Pastry Chef'),
('REQ006', '2025-10-25', 'Cooking Oil', 25, 'OUT001', 'Main Kitchen'),
('REQ007', '2025-10-26', 'Coffee Beans', 5, 'OUT002', 'Beverage Dept'),
('REQ008', '2025-10-27', 'Salt', 10, 'OUT005', 'Grill Station'),
('REQ009', '2025-10-28', 'Sugar', 20, 'OUT006', 'Service Staff'),
('REQ010', '2025-10-29', 'Basil', 2, 'OUT007', 'Pasta Station');

-- 21.
INSERT INTO tblIssue (Issue_No, Issue_Date, Req_No, Req_Date, Item, Qty, Del_Qty, Outlet_ID, Issue_Name) VALUES 
('ISS001', '2025-10-21', 'REQ001', '2025-10-20', 'Wheat Flour', 50, 50, 'OUT001', 'Inventory Manager'),
('ISS002', '2025-10-22', 'REQ002', '2025-10-21', 'Chicken', 20, 18, 'OUT001', 'Inventory Manager'),
('ISS003', '2025-10-23', 'REQ003', '2025-10-22', 'Milk', 30, 30, 'OUT002', 'Store Keeper'),
('ISS004', '2025-10-24', 'REQ004', '2025-10-23', 'Tomatoes', 15, 12, 'OUT003', 'Asst Manager'),
('ISS005', '2025-10-25', 'REQ005', '2025-10-24', 'Butter', 10, 10, 'OUT004', 'Inventory Manager'),
('ISS006', '2025-10-26', 'REQ006', '2025-10-25', 'Cooking Oil', 25, 25, 'OUT001', 'Store Keeper'),
('ISS007', '2025-10-27', 'REQ007', '2025-10-26', 'Coffee Beans', 5, 5, 'OUT002', 'Store Keeper'),
('ISS008', '2025-10-28', 'REQ008', '2025-10-27', 'Salt', 10, 10, 'OUT005', 'Inventory Manager'),
('ISS009', '2025-10-29', 'REQ009', '2025-10-28', 'Sugar', 20, 20, 'OUT006', 'Asst Manager'),
('ISS010', '2025-10-30', 'REQ010', '2025-10-29', 'Basil', 2, 2, 'OUT007', 'Store Keeper');

-- Final Check
SELECT 'Data insertion complete for all 21 tables' AS Status;