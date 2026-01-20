rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // دالة للتحقق من تسجيل الدخول
    function isSignedIn() {
      return request.auth != null;
    }
    
    // دالة للتحقق من هوية المسؤول (الأدمن)
    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email == "adelawad1@gmail.com" || 
        get(/databases/$(database)/documents/users_registry/$(request.auth.uid)).data.role == "admin"
      );
    }

    // قواعد البطاقات العامة: الجميع يقرأ، المالك والأدمن يكتبون
    match /public_cards/{cardId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && (resource.data.ownerId == request.auth.uid || isAdmin());
    }

    // سجل المستخدمين: المالك يقرأ ويكتب بياناته، والأدمن يتحكم في الكل
    match /users_registry/{userId} {
      allow read: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      allow write: if isAdmin() || (isSignedIn() && request.auth.uid == userId);
    }

    // الإعدادات والقوالب والباقات: الجميع يقرأ، والأدمن فقط يكتب
    match /settings/{docId} { allow read: if true; allow write: if isAdmin(); }
    match /custom_templates/{docId} { allow read: if true; allow write: if isAdmin(); }
    match /template_categories/{docId} { allow read: if true; allow write: if isAdmin(); }
    match /visual_styles/{docId} { allow read: if true; allow write: if isAdmin(); }
    match /pricing_plans/{docId} { allow read: if true; allow write: if isAdmin(); }

    // السماح لملف الـ PHP (الويب هوك) بتحديث رتبة المستخدم (إذا كان يستخدم مفتاح الأدمن)
    // ملاحظة: إذا كنت تستخدم Service Account في PHP، سيتم تجاوز القواعد تلقائياً وهو الأفضل.
  }
}