import { useEffect } from 'react'
import { useLanguage } from './LanguageContext'

export type Language = 'en' | 'vi'
type Pair = readonly [string, string]

const phrasePairs: readonly Pair[] = [
  ['VIP hospitality platform', 'Nền tảng dịch vụ khách sạn VIP'],
  ['Experience Unparalleled Luxury', 'Trải nghiệm đẳng cấp sang trọng vượt trội'],
  [
    'Reserve refined rooms, add personal services, and move from search to secure payment with the same polished flow shown in the VIP Booking demo.',
    'Đặt phòng cao cấp, thêm dịch vụ cá nhân và đi từ tìm kiếm đến thanh toán an toàn với quy trình mượt mà của VIP Booking.',
  ],
  ['Explore Rooms', 'Khám phá phòng'],
  ['Concierge', 'Hỗ trợ khách hàng'],
  ['Search results on home', 'Kết quả tìm kiếm trên trang chủ'],
  ['Rooms built for premium travel', 'Phòng dành cho hành trình cao cấp'],
  ['Home search', 'Tìm kiếm tại trang chủ'],
  ['Featured stays', 'Lưu trú nổi bật'],
  ['View all rooms', 'Xem tất cả phòng'],
  ['View all', 'Xem tất cả'],
  ['Found', 'Tìm thấy'],
  ['room(s) matching your search.', 'phòng phù hợp với tìm kiếm của bạn.'],
  ['Clear search', 'Xóa tìm kiếm'],
  ['No rooms matched this destination. Try another keyword or view all rooms.', 'Không có phòng phù hợp địa điểm này. Hãy thử từ khóa khác hoặc xem toàn bộ phòng.'],
  ['World-class amenities', 'Tiện ích đẳng cấp thế giới'],
  ['Weekend retreat', 'Kỳ nghỉ cuối tuần'],
  ['Private dining, skyline rooms, and arrival support in one flow.', 'Ẩm thực riêng tư, phòng view skyline và hỗ trợ đón tiếp trong một quy trình.'],
  [
    'The interface keeps the guest journey visible: select a room, confirm service add-ons, review the invoice, and pay without losing booking context.',
    'Giao diện giữ liền mạch hành trình của khách: chọn phòng, xác nhận dịch vụ bổ sung, kiểm tra hóa đơn và thanh toán không mất ngữ cảnh đặt phòng.',
  ],
  ['Start Booking', 'Bắt đầu đặt phòng'],
  ['Please enter a destination.', 'Vui lòng nhập điểm đến.'],
  ['Destination is required', 'Điểm đến là bắt buộc'],
  ['Please select check-in and check-out dates.', 'Vui lòng chọn ngày nhận phòng và trả phòng.'],
  ['Stay dates are required', 'Ngày lưu trú là bắt buộc'],
  ['Check-out must be after check-in.', 'Ngày trả phòng phải sau ngày nhận phòng.'],
  ['Invalid stay dates', 'Ngày lưu trú không hợp lệ'],
  ['Destination', 'Điểm đến'],
  ['Check in', 'Nhận phòng'],
  ['Check out', 'Trả phòng'],
  ['Search', 'Tìm kiếm'],
  ['Search destination, room, or amenity...', 'Tìm kiếm điểm đến, phòng hoặc tiện ích...'],
  ['Room listing', 'Danh sách phòng'],
  ['Available Rooms', 'Phòng hiện có'],
  ['Filter premium room types by stay style, amenities, price and guest count.', 'Lọc phòng cao cấp theo phong cách lưu trú, tiện ích, mức giá và số lượng khách.'],
  ['Room filters', 'Bộ lọc phòng'],
  ['Filters', 'Bộ lọc'],
  ['Price range', 'Khoảng giá'],
  ['Room class', 'Hạng phòng'],
  ['Amenities', 'Tiện ích'],
  ['Under 1,000,000 VND', 'Dưới 1.000.000 VND'],
  ['1,000,000 - 2,000,000 VND', '1.000.000 - 2.000.000 VND'],
  ['Over 2,000,000 VND', 'Trên 2.000.000 VND'],
  ['Recommended', 'Đề xuất'],
  ['Price: low to high', 'Giá: thấp đến cao'],
  ['Price: high to low', 'Giá: cao đến thấp'],
  ['Highest rating', 'Đánh giá cao nhất'],
  ['curated rooms found', 'phòng được chọn lọc'],
  ['No rooms match the current filter set. Try removing one or more filters.', 'Không có phòng phù hợp bộ lọc hiện tại. Hãy bớt một hoặc nhiều bộ lọc.'],
  ['A detailed room view with gallery, amenities, price summary, and availability picker.', 'Trang chi tiết phòng với bộ sưu tập ảnh, tiện ích, tóm tắt giá và lịch chọn ngày.'],
  ['Could not load room details', 'Không thể tải chi tiết phòng'],
  ['Room is missing', 'Thiếu thông tin phòng'],
  ['Room id is missing.', 'Thiếu mã phòng.'],
  ['Could not load room details.', 'Không thể tải chi tiết phòng.'],
  ['Availability', 'Tình trạng phòng'],
  ['Previous month', 'Tháng trước'],
  ['Next month', 'Tháng sau'],
  ['Starting from', 'Giá từ'],
  ['per night', 'mỗi đêm'],
  ['Guests', 'Khách'],
  ['Reserve Room', 'Đặt phòng'],
  ['Details', 'Chi tiết'],
  ['Book', 'Đặt'],
  ['/night', '/đêm'],
  ['View details for', 'Xem chi tiết'],
  ['Suite / VIP', 'Suite / VIP'],
  ['Deluxe', 'Deluxe'],
  ['Family beds', 'Giường gia đình'],
  ['4 guests', '4 khách'],
  ['3 guests', '3 khách'],
  ['2 guests', '2 khách'],
  ['1 guest', '1 khách'],
  ['Invalid booking dates', 'Ngày đặt phòng không hợp lệ'],
  ['Check-out date must be after check-in date.', 'Ngày trả phòng phải sau ngày nhận phòng.'],
  ['Missing booking dates', 'Thiếu ngày đặt phòng'],
  ['Please select both check-in and check-out dates.', 'Vui lòng chọn cả ngày nhận phòng và trả phòng.'],
  ['Click a date on the calendar to choose check-in.', 'Bấm ngày trên lịch để chọn ngày nhận phòng.'],
  ['Click a date on the calendar to choose check-out.', 'Bấm ngày trên lịch để chọn ngày trả phòng.'],
  ['Access denied', 'Không có quyền truy cập'],
  ['Admin access', 'Quyền quản trị'],
  ['Sign in as admin', 'Đăng nhập admin'],
  ['Go to home', 'Về trang chủ'],
  ['Sign in failed', 'Đăng nhập không thành công'],
  ['Registration failed', 'Đăng ký không thành công'],
  ['Invalid information', 'Thông tin chưa hợp lệ'],
  ['Book Now', 'Đặt ngay'],
  ['Login', 'Đăng nhập'],
  ['Register', 'Đăng ký'],
  ['Forgot Password?', 'Quên mật khẩu?'],
  ['Forgot password?', 'Quên mật khẩu?'],
  ['Forgot password', 'Quên mật khẩu'],
  ['Reset Password', 'Đặt lại mật khẩu'],
  ['Password', 'Mật khẩu'],
  ['Email address', 'Địa chỉ email'],
  ['Remember me', 'Ghi nhớ đăng nhập'],
  ['Or continue with', 'Hoặc tiếp tục với'],
  ['No account yet?', 'Chưa có tài khoản?'],
  ['Welcome Back', 'Chào mừng quay lại'],
  ['Sign in to access your luxury stays.', 'Đăng nhập để truy cập kỳ nghỉ cao cấp của bạn.'],
  ['Sign In', 'Đăng nhập'],
  ['Register', 'Đăng ký'],
  ['Profile', 'Hồ sơ'],
  ['Personal Information', 'Thông tin cá nhân'],
  ['Booking History', 'Lịch sử đặt phòng'],
  ['Invoices & Payments', 'Hóa đơn và thanh toán'],
  ['Security', 'Bảo mật'],
  ['Payment Success', 'Thanh toán thành công'],
  ['Payment Failed', 'Thanh toán thất bại'],
  ['Contact', 'Liên hệ'],
  ['About', 'Giới thiệu'],
  ['Home', 'Trang chủ'],
  ['Rooms', 'Phòng'],
  ['Help center', 'Trung tâm hỗ trợ'],
  ['Information', 'Thông tin'],
  ['Terms', 'Điều khoản'],
  ['Privacy policy', 'Chính sách riêng tư'],
  ['Terms of use', 'Điều khoản sử dụng'],
  ['Data protection', 'Bảo vệ dữ liệu'],
  ['Admin portal', 'Cổng quản trị'],
  ['Booking guide', 'Hướng dẫn đặt phòng'],
  ['Guest profile', 'Hồ sơ khách'],
  ['24/7 concierge and guest assistance', 'Hỗ trợ khách hàng 24/7'],
  ['VIP Hospitality Booking Company', 'Công ty đặt phòng VIP Hospitality'],
  ['All rights reserved.', 'Đã đăng ký bản quyền.'],
  ['Ocean View Grand Suite', 'Suite Grand View Biển'],
  ['Executive Sky Room', 'Phòng Executive Sky'],
  ['Garden Residence', 'Residence Vườn'],
  ['Panoramic Ocean Suite', 'Suite Toàn Cảnh Biển'],
  ['Deluxe Ocean View Suite', 'Suite Deluxe View Biển'],
  ['The Obsidian Penthouse', 'Penthouse Obsidian'],
  ['Signature Suite', 'Suite Đặc Trưng'],
  ['Business Class', 'Hạng Doanh Nhân'],
  ['Family Residence', 'Residence Gia Đình'],
  ['Deluxe Suite', 'Suite Deluxe'],
  ['Penthouse Residence', 'Residence Penthouse'],
  ['North Tower, Level 18', 'Tháp Bắc, Tầng 18'],
  ['West Wing, Level 12', 'Cánh Tây, Tầng 12'],
  ['Garden Court, Level 3', 'Khu Vườn, Tầng 3'],
  ['East Tower, Level 20', 'Tháp Đông, Tầng 20'],
  ['South Tower, Level 16', 'Tháp Nam, Tầng 16'],
  ['Skyline Crown, Level 30', 'Skyline Crown, Tầng 30'],
  [
    'A calm private suite facing the water, built for long stays, executive travel, and celebration weekends with personal arrival service.',
    'Suite riêng tư yên tĩnh hướng biển, phù hợp cho lưu trú dài ngày, công tác và kỳ nghỉ cuối tuần với dịch vụ đón tiếp cá nhân.',
  ],
  [
    'A polished room for business travel with fast check-in, ergonomic workspace, skyline views, and quiet evening service.',
    'Phòng tinh tế cho khách công tác với check-in nhanh, không gian làm việc công thái học, view skyline và dịch vụ buổi tối yên tĩnh.',
  ],
  [
    'A generous residence with a separate living room, garden terrace, and curated family amenities for slower luxury stays.',
    'Residence rộng rãi có phòng khách riêng, sân vườn và tiện ích gia đình được chọn lọc cho kỳ nghỉ sang trọng thư thái.',
  ],
  [
    'A premium ocean-facing suite with floor-to-ceiling glass, curated in-room dining, and a quiet skyline lounge for evening unwind.',
    'Suite cao cấp hướng biển với kính trần-sàn, ẩm thực tại phòng tinh chọn và lounge skyline yên tĩnh để thư giãn buổi tối.',
  ],
  [
    'An expansive suite designed for immersive sea views, private hosting, and elevated comfort with VIP arrival coordination.',
    'Suite rộng rãi thiết kế cho tầm nhìn biển trọn vẹn, tiếp khách riêng tư và sự thoải mái cao cấp với điều phối đón tiếp VIP.',
  ],
  [
    'An ultra-luxury penthouse with panoramic skyline and ocean horizon, crafted for private escapes, celebrations, and executive stays.',
    'Penthouse siêu sang với toàn cảnh skyline và đường chân trời biển, dành cho nghỉ dưỡng riêng tư, sự kiện và lưu trú doanh nhân.',
  ],
  ['Ocean-facing balcony', 'Ban công hướng biển'],
  ['Private lounge access', 'Quyền vào lounge riêng'],
  ['Smart climate control', 'Điều hòa thông minh'],
  ['Premium minibar', 'Minibar cao cấp'],
  ['Marble bathroom', 'Phòng tắm đá cẩm thạch'],
  ['Late checkout', 'Trả phòng muộn'],
  ['Free cancellation', 'Hủy miễn phí'],
  ['Breakfast included', 'Bao gồm bữa sáng'],
  ['Airport priority', 'Ưu tiên sân bay'],
  ['Executive desk', 'Bàn làm việc executive'],
  ['Soundproof windows', 'Cửa sổ cách âm'],
  ['High speed Wi-Fi', 'Wi-Fi tốc độ cao'],
  ['Coffee bar', 'Quầy cà phê'],
  ['Pressing service', 'Dịch vụ là ủi'],
  ['Meeting lounge', 'Lounge họp'],
  ['Express check-in', 'Check-in nhanh'],
  ['Workspace ready', 'Không gian làm việc sẵn sàng'],
  ['Flexible hold', 'Giữ phòng linh hoạt'],
  ['Private terrace', 'Sân hiên riêng'],
  ['Two bathrooms', 'Hai phòng tắm'],
  ['Kitchenette', 'Bếp nhỏ'],
  ['Kids amenity set', 'Bộ tiện ích trẻ em'],
  ['Laundry pickup', 'Nhận đồ giặt tận nơi'],
  ['Evening turndown', 'Dịch vụ turn-down buổi tối'],
  ['Family ready', 'Phù hợp gia đình'],
  ['Daily breakfast', 'Bữa sáng hằng ngày'],
  ['Ocean-view balcony', 'Ban công view biển'],
  ['Private check-in desk', 'Quầy check-in riêng'],
  ['Spa access', 'Quyền dùng spa'],
  ['Premium sound system', 'Hệ thống âm thanh cao cấp'],
  ['Airport pickup', 'Đưa đón sân bay'],
  ['Sunrise ocean view', 'View biển bình minh'],
  ['Priority concierge', 'Hỗ trợ ưu tiên'],
  ['King bed + sofa bed', 'Giường king + sofa bed'],
  ['Panoramic balcony', 'Ban công toàn cảnh'],
  ['Digital concierge', 'Hỗ trợ kỹ thuật số'],
  ['Daily sunset service', 'Dịch vụ hoàng hôn hằng ngày'],
  ['VIP host desk', 'Quầy lễ tân VIP'],
  ['Private pool access', 'Quyền dùng hồ bơi riêng'],
  ['In-suite wellness setup', 'Thiết lập wellness trong suite'],
  ['24/7 butler support', 'Butler 24/7'],
  ['Airport limousine transfer', 'Đưa đón limousine sân bay'],
  ['City + ocean panorama', 'Toàn cảnh thành phố + biển'],
  ['Dedicated butler', 'Butler chuyên trách'],
  ['Chauffeur service', 'Dịch vụ tài xế riêng'],
  ['2 king bedrooms', '2 phòng ngủ giường king'],
  ['King bed', 'Giường king'],
  ['Queen bed', 'Giường queen'],
  ['Two bedrooms', 'Hai phòng ngủ'],
  ['Available now', 'Có sẵn ngay'],
  ['Maintenance', 'Bảo trì'],
  ['Limited availability', 'Sắp hết phòng'],
  ['Hotel Room', 'Phòng khách sạn'],
  ['Database inventory', 'Dữ liệu tồn phòng'],
  ['Admin managed', 'Quản lý bởi admin'],
  [
    'Featuring a spacious terrace to Ly Tu Trong street, our charming Grand Suite offers tranquil views of street.',
    'Sở hữu sân hiên rộng hướng ra đường Lý Tự Trọng, Grand Suite mang đến tầm nhìn yên bình.',
  ],
  [
    'Elegant and refined, the Deluxe Connecting Room completes your stay with luxurious amenities.',
    'Thanh lịch và tinh tế, phòng Deluxe Connecting hoàn thiện kỳ nghỉ với tiện nghi cao cấp.',
  ],
  [
    'Elegant suite room with spacious balcony, where we arrange outdoor table and chairs for your relaxation time.',
    'Phòng suite thanh lịch với ban công rộng, có sẵn bàn ghế ngoài trời để bạn thư giãn.',
  ],
  ['Room size:', 'Diện tích phòng:'],
  ['View:', 'Tầm nhìn:'],
  ['City streets or rooftops', 'Đường phố hoặc mái nhà'],
  ['Beds:', 'Giường:'],
  ['Hollywood twins', 'Hai giường Hollywood'],
  ['(allows 1 double or 2 twin beds)', '(cho phép 1 giường đôi hoặc 2 giường đơn)'],
  ['(allows 2 double or 4 twin beds)', '(cho phép 2 giường đôi hoặc 4 giường đơn)'],
  ['Smoking:', 'Hút thuốc:'],
  ['Bathroom:', 'Phòng tắm:'],
  ['Separate toilet', 'Toilet riêng'],
  ['Toilet, washbasin', 'Toilet, bồn rửa mặt'],
  ['Overview', 'Tổng quan'],
  ['Bookings', 'Đặt phòng'],
  ['Operations', 'Vận hành'],
  ['Billing', 'Hóa đơn'],
  ['Room Types', 'Loại phòng'],
  ['Services', 'Dịch vụ'],
  ['Pricing', 'Giá'],
  ['Customers', 'Khách hàng'],
  ['User Roles', 'Vai trò người dùng'],
  ['Admin navigation', 'Điều hướng quản trị'],
  ['Control center', 'Trung tâm điều khiển'],
  ['Search bookings, rooms, guests...', 'Tìm kiếm đặt phòng, phòng, khách...'],
  ['No matching results.', 'Không có kết quả phù hợp.'],
  ['Notifications', 'Thông báo'],
  ['Mark all read', 'Đánh dấu đã đọc tất cả'],
  ['Admin account', 'Tài khoản quản trị'],
  ['View Profile', 'Xem hồ sơ'],
  ['Logout', 'Đăng xuất'],
  ['Administrator', 'Quản trị viên'],
  ['Now', 'Vừa xong'],
  ['Recent', 'Gần đây'],
  ['No pending booking requests right now.', 'Hiện không có yêu cầu đặt phòng chờ xử lý.'],
  ['New reservations are waiting for review.', 'Có đặt phòng mới đang chờ duyệt.'],
  ['Guest list is synced with customer management.', 'Danh sách khách được đồng bộ với mục quản lý khách hàng.'],
  ['Guests are requesting support through contact form.', 'Khách đang gửi yêu cầu hỗ trợ qua form liên hệ.'],
  ['No new customer messages right now.', 'Hiện không có tin nhắn khách hàng mới.'],
  ['Booking from', 'Đặt phòng từ'],
  ['Message from', 'Tin nhắn từ'],
  ['Service Management', 'Quản lý dịch vụ'],
  ['Add New Service', 'Thêm dịch vụ mới'],
  ['Search services...', 'Tìm kiếm dịch vụ...'],
  ['All Services', 'Tất cả dịch vụ'],
  ['Service', 'Dịch vụ'],
  ['Actions', 'Thao tác'],
  ['Edit', 'Sửa'],
  ['Delete', 'Xóa'],
  ['No services found for this filter.', 'Không tìm thấy dịch vụ theo bộ lọc này.'],
  ['Service catalog', 'Danh mục dịch vụ'],
  ['Edit Service', 'Chỉnh sửa dịch vụ'],
  ['Add Service', 'Thêm dịch vụ'],
  ['Service Name', 'Tên dịch vụ'],
  ['Status', 'Trạng thái'],
  ['Cancel', 'Hủy'],
  ['Save Changes', 'Lưu thay đổi'],
  ['Save Service', 'Lưu dịch vụ'],
  ['Room Types Management', 'Quản lý loại phòng'],
  ['Add Room Type', 'Thêm loại phòng'],
  ['Search by room number, type, or guest...', 'Tìm theo số phòng, loại phòng hoặc khách...'],
  ['Available', 'Sẵn sàng'],
  ['Occupied', 'Đang ở'],
  ['Maintenance', 'Bảo trì'],
  ['Room', 'Phòng'],
  ['No rooms found for this filter.', 'Không tìm thấy phòng theo bộ lọc này.'],
  ['Room inventory', 'Kho phòng'],
  ['Edit Room Type', 'Chỉnh sửa loại phòng'],
  ['Room name', 'Tên phòng'],
  ['Update Room Type', 'Cập nhật loại phòng'],
  ['Save Room Type', 'Lưu loại phòng'],
  ['Could not load dashboard data.', 'Không thể tải dữ liệu bảng điều khiển.'],
  ['No bookings yet', 'Chưa có đặt phòng'],
  ['Revenue', 'Doanh thu'],
  ['bookings', 'đặt phòng'],
  ['Pending bookings', 'Đặt phòng chờ xử lý'],
  ['Bookings & Check-in/out', 'Đặt phòng & nhận/trả phòng'],
  ['Rooms, Types & Pricing', 'Phòng, loại phòng & giá'],
  ['Customers & Roles', 'Khách hàng & vai trò'],
  ['Recent Bookings', 'Đặt phòng gần đây'],
  ['Guest', 'Khách'],
  ['Check in', 'Nhận phòng'],
  ['Amount', 'Số tiền'],
  ['Could not load customers.', 'Không thể tải danh sách khách hàng.'],
  ['Customer already exists', 'Khách hàng đã tồn tại'],
  ['Add Customer', 'Thêm khách hàng'],
  ['Search by ID, name, email, or phone...', 'Tìm theo ID, tên, email hoặc số điện thoại...'],
  ['All Customers', 'Tất cả khách hàng'],
  ['Active', 'Hoạt động'],
  ['Disabled', 'Vô hiệu hóa'],
  ['Customer', 'Khách hàng'],
  ['Total Spent', 'Tổng chi tiêu'],
  ['No customers found for this filter.', 'Không tìm thấy khách hàng theo bộ lọc này.'],
  ['Customer account', 'Tài khoản khách hàng'],
  ['Edit Customer', 'Chỉnh sửa khách hàng'],
  ['Billing address', 'Địa chỉ thanh toán'],
  ['Customer billing address', 'Địa chỉ thanh toán của khách hàng'],
  ['Update Customer', 'Cập nhật khách hàng'],
  ['Save Customer', 'Lưu khách hàng'],
  ['Could not load bookings.', 'Không thể tải danh sách đặt phòng.'],
  ['Confirm booking', 'Xác nhận đặt phòng'],
  ['Paid', 'Đã thanh toán'],
  ['Unpaid', 'Chưa thanh toán'],
  ['Total Bookings', 'Tổng đặt phòng'],
  ['Confirmed', 'Đã xác nhận'],
  ['Paid Revenue', 'Doanh thu đã thu'],
  ['Unpaid Amount', 'Số tiền chưa thu'],
  ['Search by booking ID, guest, room, or email...', 'Tìm theo mã đặt phòng, khách, phòng hoặc email...'],
  ['No bookings found for this filter.', 'Không tìm thấy đặt phòng theo bộ lọc này.'],
  ['Search invoice, booking, guest, room, or email...', 'Tìm hóa đơn, đặt phòng, khách, phòng hoặc email...'],
  ['No invoices found for this filter.', 'Không tìm thấy hóa đơn theo bộ lọc này.'],
  ['Edit Booking', 'Chỉnh sửa đặt phòng'],
  ['Add Booking', 'Thêm đặt phòng'],
  ['Update Booking', 'Cập nhật đặt phòng'],
  ['Save Booking', 'Lưu đặt phòng'],
  ['Could not load billing data.', 'Không thể tải dữ liệu hóa đơn.'],
  ['Search invoice, booking, guest...', 'Tìm hóa đơn, đặt phòng, khách...'],
  ['Total Invoices', 'Tổng hóa đơn'],
  ['No invoices found.', 'Không tìm thấy hóa đơn.'],
  ['Search payment, invoice, staff...', 'Tìm thanh toán, hóa đơn, nhân viên...'],
  ['No payments found.', 'Không tìm thấy thanh toán.'],
  ['Edit Invoice', 'Chỉnh sửa hóa đơn'],
  ['Add Invoice', 'Thêm hóa đơn'],
  ['Room amount', 'Tiền phòng'],
  ['Service amount', 'Tiền dịch vụ'],
  ['Total amount', 'Tổng tiền'],
  ['Note', 'Ghi chú'],
  ['Update Invoice', 'Cập nhật hóa đơn'],
  ['Save Invoice', 'Lưu hóa đơn'],
  ['Edit Payment', 'Chỉnh sửa thanh toán'],
  ['Add Payment', 'Thêm thanh toán'],
  ['Update Payment', 'Cập nhật thanh toán'],
  ['Save Payment', 'Lưu thanh toán'],
  ['Could not load hotel operations.', 'Không thể tải dữ liệu vận hành khách sạn.'],
  ['Service Usages', 'Lượt sử dụng dịch vụ'],
  ['Search booking, room, staff...', 'Tìm đặt phòng, phòng, nhân viên...'],
  ['checked in', 'đã nhận phòng'],
  ['checked out', 'đã trả phòng'],
  ['No check-in/out records found.', 'Không tìm thấy bản ghi nhận/trả phòng.'],
  ['Service Usage', 'Sử dụng dịch vụ'],
  ['Search booking, service, note...', 'Tìm đặt phòng, dịch vụ, ghi chú...'],
  ['No service usage records found.', 'Không tìm thấy bản ghi sử dụng dịch vụ.'],
  ['Edit Operation', 'Chỉnh sửa thao tác'],
  ['Add Operation', 'Thêm thao tác'],
  ['Room ID', 'Mã phòng'],
  ['Update Operation', 'Cập nhật thao tác'],
  ['Save Operation', 'Lưu thao tác'],
  ['Edit Service Usage', 'Chỉnh sửa sử dụng dịch vụ'],
  ['Add Service Usage', 'Thêm sử dụng dịch vụ'],
  ['Service ID', 'Mã dịch vụ'],
  ['Update Usage', 'Cập nhật sử dụng'],
  ['Save Usage', 'Lưu sử dụng'],
  ['User Role Management', 'Quản lý vai trò người dùng'],
  ['Search account email...', 'Tìm email tài khoản...'],
  ['All Roles', 'Tất cả vai trò'],
  ['Admins', 'Quản trị viên'],
  ['Guests', 'Khách'],
  ['Current Role', 'Vai trò hiện tại'],
  ['Admin dashboard, rooms, billing, customers, roles', 'Bảng điều khiển admin, phòng, hóa đơn, khách hàng, vai trò'],
  ['Booking flow, profile, payment', 'Luồng đặt phòng, hồ sơ, thanh toán'],
  ['No accounts found for this filter.', 'Không tìm thấy tài khoản theo bộ lọc này.'],
  ['Edit Account', 'Chỉnh sửa tài khoản'],
  ['Add Account', 'Thêm tài khoản'],
  ['Update Account', 'Cập nhật tài khoản'],
  ['Save Account', 'Lưu tài khoản'],
  ['Could not load users.', 'Không thể tải danh sách người dùng.'],
  ['Could not load users', 'Không thể tải danh sách người dùng'],
  ['Admin account required', 'Cần tài khoản quản trị viên'],
  ['Could not save account.', 'Không thể lưu tài khoản.'],
  ['Could not save account', 'Không thể lưu tài khoản'],
  ['Role updated', 'Đã cập nhật vai trò'],
  ['Could not update role.', 'Không thể cập nhật vai trò.'],
  ['Could not update role', 'Không thể cập nhật vai trò'],
  ['Delete account?', 'Xóa tài khoản?'],
  ['Delete account "', 'Xóa tài khoản "'],
  ['Could not delete account.', 'Không thể xóa tài khoản.'],
  ['Could not delete account', 'Không thể xóa tài khoản'],
  ['Could not load services.', 'Không thể tải dịch vụ.'],
  ['Could not load services', 'Không thể tải dịch vụ'],
  ['Service updated', 'Đã cập nhật dịch vụ'],
  ['Could not update service status.', 'Không thể cập nhật trạng thái dịch vụ.'],
  ['Could not update service', 'Không thể cập nhật dịch vụ'],
  ['Service saved', 'Đã lưu dịch vụ'],
  ['Could not save service.', 'Không thể lưu dịch vụ.'],
  ['Could not save service', 'Không thể lưu dịch vụ'],
  ['Delete service?', 'Xóa dịch vụ?'],
  ['Delete service "', 'Xóa dịch vụ "'],
  ['Service deleted', 'Đã xóa dịch vụ'],
  ['Could not delete service.', 'Không thể xóa dịch vụ.'],
  ['Could not delete service', 'Không thể xóa dịch vụ'],
  ['Could not load rooms.', 'Không thể tải phòng.'],
  ['Could not load rooms', 'Không thể tải phòng'],
  ['Room updated', 'Đã cập nhật phòng'],
  ['Could not update room.', 'Không thể cập nhật phòng.'],
  ['Could not update room', 'Không thể cập nhật phòng'],
  ['Delete room type?', 'Xóa loại phòng?'],
  ['Delete room type "', 'Xóa loại phòng "'],
  ['Room deleted', 'Đã xóa phòng'],
  ['Could not delete room.', 'Không thể xóa phòng.'],
  ['Could not delete room', 'Không thể xóa phòng'],
  ['Pricing rule is incomplete', 'Quy tắc giá chưa đầy đủ'],
  ['Delete pricing rule?', 'Xóa quy tắc giá?'],
  ['Delete pricing rule "', 'Xóa quy tắc giá "'],
  ['Could not update booking status.', 'Không thể cập nhật trạng thái đặt phòng.'],
  ['Could not update booking', 'Không thể cập nhật đặt phòng'],
  ['Could not save booking.', 'Không thể lưu đặt phòng.'],
  ['Could not save booking', 'Không thể lưu đặt phòng'],
  ['Delete booking?', 'Xóa đặt phòng?'],
  ['Could not delete booking.', 'Không thể xóa đặt phòng.'],
  ['Could not delete booking', 'Không thể xóa đặt phòng'],
  ['Could not save invoice.', 'Không thể lưu hóa đơn.'],
  ['Could not save invoice', 'Không thể lưu hóa đơn'],
  ['Could not save payment.', 'Không thể lưu thanh toán.'],
  ['Could not save payment', 'Không thể lưu thanh toán'],
  ['Delete invoice?', 'Xóa hóa đơn?'],
  ['Could not delete invoice.', 'Không thể xóa hóa đơn.'],
  ['Could not delete invoice', 'Không thể xóa hóa đơn'],
  ['Delete payment?', 'Xóa thanh toán?'],
  ['Could not delete payment.', 'Không thể xóa thanh toán.'],
  ['Could not delete payment', 'Không thể xóa thanh toán'],
  ['Booking ID and Room ID are required for check-in/out records.', 'Cần mã đặt phòng và mã phòng cho bản ghi nhận/trả phòng.'],
  ['Could not save check-in/out record.', 'Không thể lưu bản ghi nhận/trả phòng.'],
  ['Could not save operation', 'Không thể lưu thao tác'],
  ['Service ID and valid quantity are required for service usage.', 'Cần mã dịch vụ và số lượng hợp lệ để ghi nhận sử dụng dịch vụ.'],
  ['Service usage is incomplete', 'Thông tin sử dụng dịch vụ chưa đầy đủ'],
  ['Service usage saved', 'Đã lưu sử dụng dịch vụ'],
  ['Could not save service usage.', 'Không thể lưu sử dụng dịch vụ.'],
  ['Could not save service usage', 'Không thể lưu sử dụng dịch vụ'],
  ['Delete operation record?', 'Xóa bản ghi thao tác?'],
  ['Could not delete check-in/out record.', 'Không thể xóa bản ghi nhận/trả phòng.'],
  ['Could not delete operation', 'Không thể xóa thao tác'],
  ['Delete service usage?', 'Xóa bản ghi sử dụng dịch vụ?'],
  ['Service usage deleted', 'Đã xóa bản ghi sử dụng dịch vụ'],
  ['Could not delete service usage.', 'Không thể xóa bản ghi sử dụng dịch vụ.'],
  ['Could not delete service usage', 'Không thể xóa bản ghi sử dụng dịch vụ'],
]

const wordPairs: readonly Pair[] = []

const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT'])
const attributeNames = ['placeholder', 'title', 'aria-label']

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function replaceByPairs(input: string, pairs: readonly Pair[]) {
  let next = input

  for (const [source, target] of pairs) {
    if (!source || source === target) {
      continue
    }

    const hasWordLikePattern = /^[A-Za-z0-9 ]+$/.test(source) && !source.includes(' ')
    const regex = hasWordLikePattern
      ? new RegExp(`\\b${escapeRegex(source)}\\b`, 'g')
      : new RegExp(escapeRegex(source), 'g')

    next = next.replace(regex, target)
  }

  return next
}

export function translateText(input: string, language: Language) {
  const pairs = language === 'vi'
    ? [...phrasePairs, ...wordPairs]
    : [...phrasePairs.map(([en, vi]) => [vi, en] as const), ...wordPairs.map(([en, vi]) => [vi, en] as const)]

  return replaceByPairs(input, pairs)
}

function translateElementAttributes(element: Element, language: Language) {
  for (const attribute of attributeNames) {
    const rawValue = element.getAttribute(attribute)
    if (!rawValue) {
      continue
    }

    const translatedValue = translateText(rawValue, language)
    if (translatedValue !== rawValue) {
      element.setAttribute(attribute, translatedValue)
    }
  }

  if (element instanceof HTMLInputElement && (element.type === 'button' || element.type === 'submit')) {
    const translatedValue = translateText(element.value, language)
    if (translatedValue !== element.value) {
      element.value = translatedValue
    }
  }
}

function translateNodeTree(root: Node, language: Language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL)

  while (walker.nextNode()) {
    const currentNode = walker.currentNode

    if (currentNode.nodeType === Node.TEXT_NODE) {
      const textNode = currentNode as Text
      const parentTag = textNode.parentElement?.tagName
      if (!parentTag || skipTags.has(parentTag)) {
        continue
      }

      const originalText = textNode.nodeValue ?? ''
      if (!originalText.trim()) {
        continue
      }

      const translatedText = translateText(originalText, language)
      if (translatedText !== originalText) {
        textNode.nodeValue = translatedText
      }

      continue
    }

    if (currentNode.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(currentNode as Element, language)
    }
  }
}

export function LanguageRuntimeTranslator() {
  const { language } = useLanguage()

  useEffect(() => {
    let isApplying = false

    const apply = (node: Node) => {
      if (isApplying) {
        return
      }

      isApplying = true
      translateNodeTree(node, language)
      isApplying = false
    }

    apply(document.body)

    const observer = new MutationObserver((mutations) => {
      if (isApplying) {
        return
      }

      for (const mutation of mutations) {
        if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
          apply(mutation.target)
          continue
        }

        mutation.addedNodes.forEach((node) => apply(node))
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [language])

  return null
}

