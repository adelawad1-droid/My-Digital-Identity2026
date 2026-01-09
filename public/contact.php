<?php
/**
 * NEXTID - Updated Contact Form Processor
 * Handles new fields: website, social media, and cloud logo URL.
 */

// إعدادات الرأس للسماح بالطلبات البرمجية والرد بصيغة JSON
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// معالجة طلبات التحقق المسبق (OPTIONS) لمتصفحات الويب
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// التأكد من أن الطلب مرسل عبر بروتوكول POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit;
}

// قراءة البيانات المرسلة من الواجهة الأمامية (JSON Body)
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON data"]);
    exit;
}

/**
 * استخراج البيانات بناءً على المفاتيح الجديدة المرسلة من CustomRequest.tsx
 */
$name        = isset($data['fullName'])    ? strip_tags(trim($data['fullName']))    : 'N/A';
$company     = isset($data['companyName']) ? strip_tags(trim($data['companyName'])) : 'N/A';
$email       = isset($data['email'])       ? filter_var(trim($data['email']), FILTER_SANITIZE_EMAIL) : 'N/A';
$phone       = isset($data['phone'])       ? strip_tags(trim($data['phone']))       : 'N/A';
$count       = isset($data['staffCount'])  ? strip_tags(trim($data['staffCount']))  : '0';
$details     = isset($data['details'])     ? strip_tags(trim($data['details']))     : '';
$website     = isset($data['website'])     ? filter_var(trim($data['website']), FILTER_SANITIZE_URL) : 'N/A';
$socialMedia = isset($data['socialMedia']) ? strip_tags(trim($data['socialMedia'])) : 'N/A';
$logoUrl     = isset($data['logoUrl'])     ? filter_var(trim($data['logoUrl']), FILTER_SANITIZE_URL) : '';

// إعدادات البريد الإلكتروني
$to       = "info@nextid.my"; 
$from     = "no-reply@nextid.my"; 
$subject  = "طلب بطاقات جديد: " . $company;

// تجهيز رابط الشعار للعرض في الإيميل
$logo_html = !empty($logoUrl) 
    ? "<a href='{$logoUrl}' target='_blank' style='color: #2563eb; font-weight: bold;'>اضغط هنا لفتح الشعار</a>" 
    : "<span style='color: #999;'>لم يتم رفع شعار</span>";

// تنسيق محتوى الرسالة (HTML)
$email_content = "
<html>
<head>
    <title>طلب تصميم بطاقات لجهة/شركة</title>
</head>
<body dir='rtl' style='font-family: Arial, sans-serif; background-color: #f4f7f6; padding: 20px;'>
    <div style='max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);'>
        <h2 style='color: #2563eb; border-bottom: 2px solid #eee; padding-bottom: 10px;'>وصلك طلب شركة جديد</h2>
        
        <table border='0' cellpadding='10' style='width: 100%;'>
            <tr style='background-color: #f9fafb;'>
                <td width='30%'><strong>الاسم الكامل:</strong></td>
                <td>{$name}</td>
            </tr>
            <tr>
                <td><strong>الشركة / الجهة:</strong></td>
                <td>{$company}</td>
            </tr>
            <tr style='background-color: #f9fafb;'>
                <td><strong>البريد الإلكتروني:</strong></td>
                <td><a href='mailto:{$email}'>{$email}</a></td>
            </tr>
            <tr>
                <td><strong>رقم الهاتف:</strong></td>
                <td><a href='tel:{$phone}'>{$phone}</a></td>
            </tr>
            <tr style='background-color: #f9fafb;'>
                <td><strong>عدد الموظفين:</strong></td>
                <td>{$count}</td>
            </tr>
            <tr>
                <td><strong>رابط الموقع:</strong></td>
                <td><a href='{$website}' target='_blank'>{$website}</a></td>
            </tr>
            <tr style='background-color: #f9fafb;'>
                <td><strong>حساب التواصل:</strong></td>
                <td>{$socialMedia}</td>
            </tr>
            <tr>
                <td><strong>شعار الشركة:</strong></td>
                <td>{$logo_html}</td>
            </tr>
        </table>

        <div style='margin-top: 20px; padding: 15px; background: #f0f4ff; border-radius: 10px;'>
            <strong style='color: #2563eb; display: block; margin-bottom: 5px;'>تفاصيل إضافية:</strong>
            <p style='margin: 0; line-height: 1.6;'>" . nl2br($details) . "</p>
        </div>

        <p style='color: #999; font-size: 11px; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 10px;'>
            هذه الرسالة أرسلت آلياً من نظام طلبات هويتي NextID.
        </p>
    </div>
</body>
</html>
";

// إعدادات رأس البريد (Headers)
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= "From: NextID Orders <$from>" . "\r\n";
$headers .= "Reply-To: $email" . "\r\n"; 
$headers .= "X-Mailer: PHP/" . phpversion();

// تنفيذ الإرسال
if (mail($to, $subject, $email_content, $headers)) {
    http_response_code(200);
    echo json_encode(["status" => "success", "message" => "Request processed successfully"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to send email. Check server mail logs."]);
}