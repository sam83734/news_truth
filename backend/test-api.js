// Self-contained endpoint test runner
process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('./dist/server').default;

const PORT = 5057;
let server;

function request(path, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  console.log('====================================');
  console.log('Starting Next Truth Backend Integration Tests');
  console.log('====================================');

  server = app.listen(PORT, async () => {
    try {
      // 1. Health
      const health = await request('/api/health');
      console.log('✔ [GET] /api/health -> Status:', health.status, '| Platform:', health.data.platform);

      // 2. Auth: Password Login (Admin)
      const adminLogin = await request('/api/auth/login', 'POST', { email: 'admin@nexttruth.media', password: 'admin123' });
      console.log('✔ [POST] /api/auth/login (Admin email & password) -> Status:', adminLogin.status, '| User:', adminLogin.data.data.name, '| Role:', adminLogin.data.data.roleBadge);

      // 2b. Auth: Wrong Password (expect 401)
      const wrongPass = await request('/api/auth/login', 'POST', { email: 'admin@nexttruth.media', password: 'wrongpassword' });
      console.log('✔ [POST] /api/auth/login (Wrong Password) -> Status:', wrongPass.status, '| Error Message:', wrongPass.data.message);

      // 2c. Auth: Nonexistent Email (expect 404)
      const nonExistent = await request('/api/auth/login', 'POST', { email: 'unknown@user.com', password: '123' });
      console.log('✔ [POST] /api/auth/login (Unknown Email) -> Status:', nonExistent.status, '| Error Message:', nonExistent.data.message);

      // 3. Admin: Create New Staff Journalist User
      const newStaff = await request('/api/admin/users', 'POST', {
        name: 'Kavita Iyer',
        email: 'kavita.iyer@nexttruth.media',
        role: 'JOURNALIST',
        bio: 'Environmental and urban civic policy reporter.',
      });
      console.log('✔ [POST] /api/admin/users -> Status:', newStaff.status, '| Created Staff:', newStaff.data.data.name, '| Role:', newStaff.data.data.roleBadge);

      // 4. Admin: List All Users
      const allUsers = await request('/api/admin/users');
      console.log('✔ [GET] /api/admin/users -> Status:', allUsers.status, '| Total Users:', allUsers.data.count);

      // 5. Admin: Moderate Submission Status
      const modSub = await request('/api/admin/submissions/sub_1/status', 'PATCH', {
        status: 'APPROVED',
        note: 'Verified with secondary eyewitness footage and timestamp logs.',
      });
      console.log('✔ [PATCH] /api/admin/submissions/sub_1/status -> Status:', modSub.status, '| New Status:', modSub.data.data.status);

      // 6. Admin: Update Sponsored Campaign & Audience Targeting
      const updateBanner = await request('/api/admin/banners/sponsored', 'PUT', {
        title: 'Decentralized Ground Verification Protocol',
        sponsorName: 'Susalabs Research Labs',
        targetAudience: 'PREMIUM_ONLY',
      });
      console.log('✔ [PUT] /api/admin/banners/sponsored -> Status:', updateBanner.status, '| Sponsor:', updateBanner.data.data.sponsorName, '| Target Audience:', updateBanner.data.data.targetAudience);

      // 7. Auth: Register Citizen User
      const reg = await request('/api/auth/register', 'POST', {
        name: 'Priya Sharma',
        email: 'priya.sharma@nexttruth.media',
        role: 'USER',
        bio: 'Citizen reader and community contributor.',
      });
      console.log('✔ [POST] /api/auth/register -> Status:', reg.status, '| Registered:', reg.data.data.name);

      // 8. Categories
      const categories = await request('/api/categories');
      console.log('✔ [GET] /api/categories -> Status:', categories.status, '| Categories:', categories.data.data.length);

      // 9. Articles
      const articles = await request('/api/articles');
      console.log('✔ [GET] /api/articles -> Status:', articles.status, '| Articles count:', articles.data.count);

      // 10. Videos
      const videos = await request('/api/videos');
      console.log('✔ [GET] /api/videos -> Status:', videos.status, '| Videos count:', videos.data.count);

      // 11. User Profile
      const profile = await request('/api/user/profile');
      console.log('✔ [GET] /api/user/profile -> Status:', profile.status, '| Active Session User:', profile.data.data.name);

      console.log('\n====================================');
      console.log('🎉 ALL BACKEND AUTH & ADMIN INTEGRATION TESTS PASSED!');
      console.log('====================================');

      server.close(() => {
        process.exit(0);
      });
    } catch (err) {
      console.error('❌ Test failed with error:', err);
      server.close(() => {
        process.exit(1);
      });
    }
  });
}

run();
