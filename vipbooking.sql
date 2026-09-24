-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: vipbooking
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `booking`
--

DROP TABLE IF EXISTS `booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking` (
  `booking_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `booking_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `guest_count` int unsigned NOT NULL,
  `special_request` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('pending','confirmed','checked_in','checked_out','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `Booking_user_id_fkey` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking`
--

LOCK TABLES `booking` WRITE;
/*!40000 ALTER TABLE `booking` DISABLE KEYS */;
INSERT INTO `booking` VALUES (1,3,'2026-05-25 15:09:41','2026-06-10','2026-06-12',2,'Near elevator','confirmed','2026-05-25 15:09:41','2026-05-25 15:09:41'),(2,5,'2026-05-25 15:11:29','2026-06-10','2026-06-12',2,'High floor','confirmed','2026-05-25 15:11:29','2026-05-25 15:11:29'),(3,6,'2026-05-25 15:12:34','2026-06-10','2026-06-12',2,'High floor','confirmed','2026-05-25 15:12:34','2026-05-25 15:12:34'),(4,7,'2026-05-25 15:26:25','2026-07-10','2026-07-12',2,'Updated by customer token','pending','2026-05-25 15:26:25','2026-05-25 15:26:25'),(10,2,'2026-05-30 21:24:11','2026-10-10','2026-10-13',2,'High floor, quiet room, and champagne on arrival.','pending','2026-05-30 21:24:11','2026-05-30 21:24:11'),(11,2,'2026-05-30 21:25:08','2026-10-10','2026-10-13',2,'High floor, quiet room, and champagne on arrival.','pending','2026-05-30 21:25:08','2026-05-30 21:25:08'),(12,2,'2026-09-22 14:50:09','2026-10-13','2026-10-14',1,'Anh Nguyen - Ưu tiên tầng cao, phòng yên tĩnh và champagne khi nhận phòng.','pending','2026-09-22 14:50:09','2026-09-22 14:50:09'),(13,2,'2026-06-05 08:00:00','2026-06-15','2026-06-18',2,'Request quiet room on high floor','confirmed','2026-09-22 22:02:30','2026-09-22 22:02:30'),(14,19,'2026-06-05 09:30:00','2026-06-20','2026-06-22',1,'Early check-in if possible','pending','2026-09-22 22:02:30','2026-09-22 22:02:30'),(15,20,'2026-06-05 10:15:00','2026-07-01','2026-07-05',3,'Extra bed requested','confirmed','2026-09-22 22:02:30','2026-09-22 22:02:30'),(16,21,'2026-06-05 11:00:00','2026-07-10','2026-07-12',2,'Non-smoking room','checked_in','2026-09-22 22:02:30','2026-09-22 22:02:30'),(17,22,'2026-06-05 14:20:00','2026-08-01','2026-08-05',4,'Family trip, near elevator','pending','2026-09-22 22:02:30','2026-09-22 22:02:30'),(18,2,'2026-09-22 15:16:28','2026-10-10','2026-10-13',2,'Anh Nguyen - Ưu tiên tầng cao, phòng yên tĩnh và champagne khi nhận phòng.','pending','2026-09-22 15:16:28','2026-09-22 15:16:28'),(19,2,'2026-09-23 04:06:15','2026-10-10','2026-10-13',2,'Anh Nguyen - Ưu tiên tầng cao, phòng yên tĩnh và champagne khi nhận phòng.','pending','2026-09-23 04:06:15','2026-09-23 04:06:15'),(20,2,'2026-09-23 04:07:17','2026-10-10','2026-10-13',2,'Anh Nguyen - Ưu tiên tầng cao, phòng yên tĩnh và champagne khi nhận phòng.','pending','2026-09-23 04:07:17','2026-09-23 04:07:17'),(21,2,'2026-09-23 08:40:45','2026-09-30','2026-10-02',2,'Anh Nguyen - Ưu tiên tầng cao, phòng yên tĩnh và champagne khi nhận phòng.','pending','2026-09-23 08:40:45','2026-09-23 08:40:45');
/*!40000 ALTER TABLE `booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookingdetail`
--

DROP TABLE IF EXISTS `bookingdetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookingdetail` (
  `booking_detail_id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `room_id` bigint unsigned NOT NULL,
  `price_per_night` decimal(12,2) NOT NULL,
  `number_of_nights` int NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`booking_detail_id`),
  KEY `BookingDetail_booking_id_fkey` (`booking_id`),
  KEY `BookingDetail_room_id_fkey` (`room_id`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookingdetail`
--

LOCK TABLES `bookingdetail` WRITE;
/*!40000 ALTER TABLE `bookingdetail` DISABLE KEYS */;
INSERT INTO `bookingdetail` VALUES (1,1,2,1200000.00,2,2400000.00,NULL),(2,2,3,1200000.00,2,2400000.00,NULL),(3,3,4,1200000.00,2,2400000.00,NULL),(4,4,5,500000.00,2,1000000.00,NULL),(9,9,1,900000.00,2,1800000.00,NULL),(10,10,5,500000.00,3,1500000.00,NULL),(11,11,5,500000.00,3,1500000.00,NULL),(12,12,4,1600000.00,1,1600000.00,NULL),(13,13,2,5000.00,3,15000.00,'Superior room booking detail'),(14,14,3,2500000.00,2,5000000.00,'VIP suite room booking detail'),(15,15,4,1600000.00,4,6400000.00,'Deluxe room booking detail'),(16,16,5,2500000.00,2,5000000.00,'Grand suite room booking detail'),(17,17,3,2500000.00,4,10000000.00,'Family trip room detail'),(18,18,1,1000000.00,3,3000000.00,NULL),(19,19,15,2500000.00,3,7500000.00,NULL),(20,20,1,1000000.00,3,3000000.00,NULL),(21,21,16,2500000.00,2,5000000.00,NULL);
/*!40000 ALTER TABLE `bookingdetail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `checkinout`
--

DROP TABLE IF EXISTS `checkinout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `checkinout` (
  `check_in_out_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `room_id` bigint unsigned NOT NULL,
  `staff_id` bigint unsigned NOT NULL,
  `check_in_time` datetime NOT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `status` enum('checked_in','checked_out') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`check_in_out_id`),
  KEY `CheckInOut_booking_id_fkey` (`booking_id`),
  KEY `CheckInOut_room_id_fkey` (`room_id`),
  KEY `CheckInOut_staff_id_fkey` (`staff_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `checkinout`
--

LOCK TABLES `checkinout` WRITE;
/*!40000 ALTER TABLE `checkinout` DISABLE KEYS */;
INSERT INTO `checkinout` VALUES (1,1,2,2,'2026-05-25 15:09:41',NULL,'checked_in','Flow check in'),(2,2,3,2,'2026-05-25 15:11:29',NULL,'checked_in','Flow2 check in'),(3,3,4,2,'2026-05-25 15:13:07',NULL,'checked_in','Step check in'),(6,13,2,2,'2026-06-15 14:00:00',NULL,'checked_in','Guest checked in successfully'),(7,14,3,2,'2026-06-20 13:30:00',NULL,'checked_in','VIP guest arrived'),(8,16,5,2,'2026-07-10 14:15:00',NULL,'checked_in','Standard check-in process');
/*!40000 ALTER TABLE `checkinout` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `invoice_id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `invoice_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `issued_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `room_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `service_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `surcharge_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `tax_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `invoice_status` enum('unpaid','partial_paid','paid','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `invoice_code` (`invoice_code`),
  KEY `Invoice_booking_id_fkey` (`booking_id`)
) ENGINE=MyISAM AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
INSERT INTO `invoice` VALUES (1,1,'INV-1779721780652','2026-05-25 15:09:41',2400000.00,300000.00,0.00,0.00,0.00,2700000.00,'paid','','2026-05-25 15:09:41'),(2,2,'INV-1779721889097','2026-05-25 15:11:29',2400000.00,160000.00,0.00,0.00,0.00,2560000.00,'paid','','2026-05-25 15:11:29'),(3,3,'INV-1779721986791','2026-05-25 15:13:07',2400000.00,160000.00,0.00,0.00,0.00,2560000.00,'paid',' ','2026-05-25 15:13:07'),(6,10,'INV-1780176254771','2026-05-30 21:24:15',2000.00,0.00,0.00,0.00,0.00,2000.00,'paid',' ','2026-05-30 21:24:24'),(7,11,'INV-1780176311356','2026-05-30 21:25:11',5000.00,0.00,0.00,0.00,0.00,5000.00,'paid',' ','2026-05-30 21:25:17'),(8,12,'INV-1790088615283','2026-09-22 14:50:15',1600000.00,0.00,0.00,0.00,0.00,1600000.00,'unpaid',NULL,'2026-09-22 14:50:15'),(9,13,'INV-1790089507','2026-06-05 15:00:00',15000.00,0.00,0.00,0.00,0.00,15000.00,'paid','Invoice for booking 1','2026-06-05 15:00:00'),(10,14,'INV-1790089508','2026-06-05 15:30:00',5000000.00,200000.00,0.00,0.00,0.00,5200000.00,'unpaid','Pending payment invoice','2026-06-05 15:30:00'),(11,15,'INV-1790089509','2026-06-05 16:00:00',6400000.00,500000.00,0.00,0.00,0.00,6900000.00,'paid','Fully paid invoice','2026-06-05 16:00:00'),(12,18,'INV-1790090196187','2026-09-22 15:16:36',3000000.00,0.00,0.00,0.00,0.00,3000000.00,'unpaid',NULL,'2026-09-22 15:16:36'),(13,19,'INV-1790136380171','2026-09-23 04:06:20',7500000.00,0.00,0.00,0.00,0.00,7500000.00,'unpaid',NULL,'2026-09-23 04:06:20'),(14,21,'INV-1790152850040','2026-09-23 08:40:50',5000000.00,0.00,0.00,0.00,0.00,5000000.00,'unpaid',NULL,'2026-09-23 08:40:50');
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoicedetail`
--

DROP TABLE IF EXISTS `invoicedetail`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoicedetail` (
  `invoice_detail_id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint NOT NULL,
  `item_type` enum('room','service','surcharge','discount') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint DEFAULT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`invoice_detail_id`),
  KEY `InvoiceDetail_invoice_id_fkey` (`invoice_id`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoicedetail`
--

LOCK TABLES `invoicedetail` WRITE;
/*!40000 ALTER TABLE `invoicedetail` DISABLE KEYS */;
INSERT INTO `invoicedetail` VALUES (1,1,'room',2,'Phòng F177972178',2,1200000.00,2400000.00),(2,1,'service',2,'Breakfast Flow 1779721780',2,150000.00,300000.00),(3,2,'room',3,'Phòng G177972188',2,1200000.00,2400000.00),(4,2,'service',3,'Laundry Flow2 1779721888',2,80000.00,160000.00),(5,3,'room',4,'Phòng H177972192',2,1200000.00,2400000.00),(6,3,'service',4,'Food Step 1779721953',2,80000.00,160000.00),(11,6,'room',5,'Phòng TST01',3,500000.00,1500000.00),(12,7,'room',5,'Phòng TST01',3,500000.00,1500000.00),(13,8,'room',4,'Phòng 403',1,1600000.00,1600000.00),(14,9,'room',2,'Phòng Superior 202',3,5000.00,15000.00),(15,10,'room',3,'Phòng Suite / VIP 304',2,2500000.00,5000000.00),(16,10,'service',1,'Aroma Body Massage',1,200000.00,200000.00),(17,11,'room',4,'Phòng Deluxe 403',4,1600000.00,6400000.00),(18,11,'service',3,'Luxury Airport Transfer',1,500000.00,500000.00),(19,12,'room',1,'Phòng 301',3,1000000.00,3000000.00),(20,13,'room',15,'Phòng 401',3,2500000.00,7500000.00),(21,14,'room',16,'Phòng 402',2,2500000.00,5000000.00);
/*!40000 ALTER TABLE `invoicedetail` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` enum('cash','bank_transfer','online') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','success','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `paid_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `staff_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `Payment_invoice_id_fkey` (`invoice_id`),
  KEY `Payment_staff_id_fkey` (`staff_id`)
) ENGINE=MyISAM AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,1,2000.00,'cash','success','2026-05-25 15:09:41',2),(2,2,4400.00,'cash','success','2026-05-25 15:11:29',2),(3,3,3000.00,'cash','success','2026-05-25 15:13:07',2),(6,6,2000.00,'bank_transfer','success','2026-05-30 21:24:24',2),(7,7,5000.00,'online','success','2026-05-30 21:25:17',2),(8,8,1728000.00,'bank_transfer','pending','2026-09-22 14:50:15',2),(9,8,1728000.00,'bank_transfer','pending','2026-09-22 14:50:21',2),(10,8,1728000.00,'bank_transfer','pending','2026-09-22 14:50:22',2),(11,8,1728000.00,'bank_transfer','pending','2026-09-22 14:50:23',2),(12,8,1728000.00,'bank_transfer','pending','2026-09-22 14:50:32',2),(13,9,15000.00,'cash','success','2026-06-05 15:05:00',2),(14,10,5200000.00,'bank_transfer','success','2026-06-05 15:35:00',2),(15,11,6900000.00,'online','success','2026-06-05 16:05:00',2),(16,12,3540000.00,'bank_transfer','pending','2026-09-22 15:16:36',2),(17,13,8400000.00,'bank_transfer','pending','2026-09-23 04:06:20',2),(18,13,8400000.00,'bank_transfer','pending','2026-09-23 04:06:27',2),(19,13,8400000.00,'bank_transfer','pending','2026-09-23 04:06:29',2),(20,13,8400000.00,'bank_transfer','pending','2026-09-23 04:06:30',2),(21,14,5400000.00,'bank_transfer','pending','2026-09-23 08:40:50',2);
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `role_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'admin','Admin'),(3,'customer','Client ');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room`
--

DROP TABLE IF EXISTS `room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room` (
  `room_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `room_number` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `floor` int unsigned NOT NULL,
  `status` enum('available','booked','occupied','maintenance') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `room_number` (`room_number`),
  KEY `Room_type_id_fkey` (`type_id`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room`
--

LOCK TABLES `room` WRITE;
/*!40000 ALTER TABLE `room` DISABLE KEYS */;
INSERT INTO `room` VALUES (1,'301',3,'maintenance','Spacious enough to accommodate a family of 3 OR a group of friends, Superior Room is well appointed with lamps and architectural lighting enhancing the cozy feel.\n\nRoom size: 25 sqm\nView: No window\nBeds: Hollywood twins (allows 1 double or 2 twin beds',NULL,1),(2,'202',2,'available','Spacious enough to accommodate a family of 3 OR a group of friends, the Superior Room is well-appointed with lamps and architectural lighting enhancing the cozy feel.\r\n\r\nRoom size: 25 sqm\r\nView: The window can see the whole city\r\nBeds: Hollywood twins',NULL,2),(3,'304',3,'available','Elegant suite room with spacious balcony, where we arrange outdoor table and chairs for your relaxation time.\r\n\r\nRoom size: 75 sqm\r\nView: City streets or rooftops\r\nBeds: Hollywood twins (allows 1 double or 2 twin beds)\r\nSmoking: No\r\nBathroom: Separate toi',NULL,4),(4,'403',4,'available','Elegant and refined, the Deluxe Connecting Room completes your stay with luxurious amenities.\r\n\r\nRoom size: 44 - 50 sqm\r\nView: Neighboring or street view\r\nBeds: Hollywood twins (allows 2 double or 4 twin beds)\r\nSmoking: No\r\nBathroom: Toilet, washbasin',NULL,3),(5,'104',1,'available','Featuring a spacious terrace to Ly Tu Trong street, our charming Grand Suite offers tranquil views of street.\n\nRoom size: 50 sqm\nView: City streets or rooftops\nBeds: Hollywood twins (allows 1 double or 2 twin beds)\nSmoking: No\nBathroom: Separate toilet',NULL,4),(9,'101',1,'available','Standard room located near the lobby. Room size: 25 sqm.',NULL,1),(10,'102',1,'available','Standard twin room with cozy lighting. Room size: 25 sqm.',NULL,1),(11,'201',2,'available','Superior room with modern interior and city view. Room size: 30 sqm.',NULL,2),(12,'203',2,'maintenance','Superior room undergoing scheduled maintenance.',NULL,2),(13,'302',3,'available','Deluxe room with beautiful ocean view. Room size: 45 sqm.',NULL,3),(14,'303',3,'booked','Deluxe king bed room, quiet environment. Room size: 45 sqm.',NULL,3),(15,'401',4,'available','Presidential Suite with private balcony and premium facilities. Room size: 80 sqm.',NULL,4),(16,'402',4,'occupied','Luxury VIP suite currently occupied.',NULL,4);
/*!40000 ALTER TABLE `room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roomtype`
--

DROP TABLE IF EXISTS `roomtype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roomtype` (
  `room_type_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `room_type_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `capacity` int unsigned NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`room_type_id`)
) ENGINE=MyISAM AUTO_INCREMENT=1003 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roomtype`
--

LOCK TABLES `roomtype` WRITE;
/*!40000 ALTER TABLE `roomtype` DISABLE KEYS */;
INSERT INTO `roomtype` VALUES (1,'Standard',1000000.00,2,'1 - 2 guestsStandard room, lowest price. Used to test the user flow for solo, budget travelers.'),(2,'Superior',1300000.00,2,'Mid-range room, moderate size, standard view.'),(3,'Deluxe',1600000.00,3,'Premium room, scenic view (ocean/pool view). This is the exact room type linked to booking_id: \"1\" from the previous steps.'),(4,'Suite / VIP',2500000.00,4,'Presidential / Family suite, highest price, large capacity. Used to test Zod validation for guest limits (if guest_count: 5 is passed, the system will throw a room capacity exceeded error).');
/*!40000 ALTER TABLE `roomtype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `service_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `service_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `unit_price` decimal(12,2) NOT NULL,
  `unit` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration` int unsigned DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`)
) ENGINE=MyISAM AUTO_INCREMENT=1006 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service`
--

LOCK TABLES `service` WRITE;
/*!40000 ALTER TABLE `service` DISABLE KEYS */;
INSERT INTO `service` VALUES (1,'Aroma Body Massage','60-minute relaxing full body spa treatment',300000.00,'person','active',60,'2026-05-25 14:55:19','2026-05-25 14:57:04'),(2,'Express Laundry','Same-day wash and fold clothing service',60000.00,'kg','active',NULL,'2026-05-25 15:09:41','2026-05-25 15:09:41'),(3,'Luxury Airport Transfer','Private airport pick-up/drop-off service',600000.00,'trip','active',NULL,'2026-05-25 15:11:29','2026-05-25 15:11:29'),(4,'Rooftop Poolside Cocktail','Signature cocktails served at the sky bar',180000.00,'glass','active',NULL,'2026-05-25 15:12:34','2026-05-25 15:12:34'),(1003,'Sunset Yoga Class','Relaxing 45-minute yoga session by the pool',150000.00,'session','active',45,'2026-09-22 22:07:02','2026-09-22 22:07:02'),(1004,'Room Dining Breakfast','Deluxe breakfast served directly to your room',120000.00,'portion','active',NULL,'2026-09-22 22:07:02','2026-09-22 22:07:02'),(1005,'Mini Bar Snack Pack','Assorted snacks and beverages in room fridge',80000.00,'pack','active',NULL,'2026-09-22 22:07:02','2026-09-22 22:07:02');
/*!40000 ALTER TABLE `service` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `serviceusage`
--

DROP TABLE IF EXISTS `serviceusage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `serviceusage` (
  `service_usage_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `service_id` bigint unsigned NOT NULL,
  `quantity` int unsigned NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `note` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `used_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `booking_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`service_usage_id`),
  KEY `ServiceUsage_service_id_fkey` (`service_id`),
  KEY `ServiceUsage_booking_id_fkey` (`booking_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `serviceusage`
--

LOCK TABLES `serviceusage` WRITE;
/*!40000 ALTER TABLE `serviceusage` DISABLE KEYS */;
INSERT INTO `serviceusage` VALUES (1,2,2,60000.00,180000.00,'3 kilograms','2026-05-25 15:09:41',1),(2,3,2,600000.00,600000.00,'1 trip for family\r\n','2026-05-25 15:11:29',2),(3,4,2,180000.00,360000.00,'','2026-05-25 15:12:34',3),(6,1003,2,150000.00,300000.00,'Yoga for 2 people','2026-09-22 22:07:09',13),(7,1004,1,120000.00,120000.00,'In-room breakfast','2026-09-22 22:07:09',14),(8,1005,3,80000.00,240000.00,'Minibar usage','2026-09-22 22:07:09',15);
/*!40000 ALTER TABLE `serviceusage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `user_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive','locked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `role_id` bigint unsigned NOT NULL,
  `reset_code` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_code_expires` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `User_role_id_fkey` (`role_id`)
) ENGINE=MyISAM AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (2,'admin@vipbooking.local','$2b$10$H5IfJPX0YOlNE2Y0E879C.v9D9R/zAY2LU24ahxLgrv3x7YZWotum','Admin VIP Booking','0900000001','active','2026-05-25 14:54:48','2026-05-25 14:54:48',1,NULL,NULL),(19,'user1@gmail.com','$2b$10$H5IfJPX0YOlNE2Y0E879C.v9D9R/zAY2LU24ahxLgrv3x7YZWotum','Nguyễn Gia Bảo','098543212312','active','2026-05-26 14:29:45','2026-05-26 14:29:45',3,NULL,NULL),(20,'testmoi@gmail.com','$2b$10$H5IfJPX0YOlNE2Y0E879C.v9D9R/zAY2LU24ahxLgrv3x7YZWotum','User Test Moi','0912345678','active','2026-05-29 15:47:23','2026-05-29 15:47:23',3,NULL,NULL),(21,'danhhkt8@gmail.com','$2b$10$uUOlKgJsvVQwHPSPhneI9OvyPBbzPjpWEHpVNxDsZX551PReeKbiu','Dương Đình Danh','0901234567','active','2026-06-04 05:19:10','2026-06-04 05:19:10',3,NULL,NULL),(22,'lachientoeic@gmail.com','$2b$10$.GA0u0fqKoV6bMfXisHcIOnjMosE3fULwHuRtRu1ddcIVhVLtL.52','Dương Đình Danh','0901234567','active','2026-06-04 14:00:15','2026-06-04 14:00:15',3,NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-24  8:47:37
