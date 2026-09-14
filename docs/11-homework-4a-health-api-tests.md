# Homework 4A — mục 4 và 6

## Mục 4: health-check và application logs

`GET /api/health` trả HTTP **200** với `status`, `timestamp`, `service`
và `uptimeSeconds`. Endpoint này là **liveness**: xác nhận tiến trình HTTP
đang hoạt động, không khẳng định database đang sẵn sàng. Kiểm tra kết nối
Supabase khi khởi động vẫn được giữ ở `server/server.js`.

Mỗi request có header phản hồi `X-Request-Id` do server tạo. Access log JSON
ghi timestamp, level, event, requestId, method, path, status và durationMs.
Request 4xx dùng level `warn`, 5xx dùng `error`. Middleware đặt trước JSON
parser để request lỗi parse cũng được ghi log.

Error handler ghi event `request_error` cùng requestId để đối chiếu với
access log. Log mới không ghi body, header authorization, query string hoặc
thông báo lỗi database thô. Response lỗi hiện có được giữ nguyên.

Chạy server với cấu hình Supabase của bạn trong `.env`:

```powershell
cd server
npm start
```

Gọi health-check từ terminal khác:

```powershell
curl.exe -i http://localhost:5000/api/health
```

Ví dụ định dạng log (giá trị minh họa):

```json
{"timestamp":"2026-09-14T12:00:00.000Z","level":"info","event":"http_request","requestId":"82b70b68-606b-4b2b-98ee-a63965cfd784","method":"GET","path":"/api/health","status":200,"durationMs":2.1}
```

## Mục 6: automated API tests

```powershell
cd server
npm test
```

Nếu chưa có dependency, khôi phục từ lockfile bằng `npm ci`. Không cần thêm
package: bộ test dùng `node:test` và `supertest` đã có trong project.

`server/tests/api.test.js` gửi HTTP request qua Express thật, đi qua router,
validator, controller, service, mapper và middleware. Chỉ lớp truy vấn
Supabase được giả lập; network fetch bị chặn trong test. Không cần `.env`
hoặc secret thật và không ghi dữ liệu vào database thật. Vì vậy đây là test
tích hợp API, không phải bằng chứng tích hợp database/persistence.

| Test | Kết quả kiểm tra |
| --- | --- |
| GET `/api/health` | 200, JSON health, uptime, requestId, log không chứa token |
| POST `/api/v1/tasks`, payload hợp lệ | 201, task ID, title đã trim, defaults, mapping dữ liệu |
| POST `/api/v1/tasks`, payload sai | 400, lỗi projectId/title/dueAt, không gọi storage |
| GET `/api/v1/tasks`, storage lỗi | 500, error log và access log cùng requestId, log không lộ lỗi thô |

Kết quả thực tế chạy trong workspace:

```text
✔ GET /api/health returns liveness and a correlated request log
✔ POST /api/v1/tasks accepts a valid request and returns the created task (201)
✔ POST /api/v1/tasks rejects invalid input before accessing storage (400)
✔ GET /api/v1/tasks reports storage failures and correlates safe error logs (500)
✔ create task applies defaults
✔ create task rejects a past deadline
✔ partial task updates preserve omitted fields
tests 7
pass 7
fail 0
```

Test validator cũ đã đổi deadline cố định sang ngày mai để không tự hỏng
khi ngày chạy vượt qua mốc cuối năm 2026.

### Request mẫu để kiểm tra thủ công

Payload hợp lệ dưới đây sẽ tạo task thật nếu gọi vào server đang kết nối
database. Thay projectId bằng ID project tồn tại:

```powershell
$taskPayload = @{
  projectId = 'UUID-PROJECT-THUC-TE'
  title = 'Verify Homework 4A API'
  dueAt = (Get-Date).ToUniversalTime().AddDays(1).ToString('o')
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/v1/tasks -ContentType 'application/json' -Body $taskPayload
```

Payload không hợp lệ, kỳ vọng HTTP 400:

```json
{"projectId":"invalid-id","title":"x","dueAt":"2020-01-01T00:00:00.000Z"}
```

## Mục 5 và phạm vi thay đổi

Đã kiểm tra: `server/.env.example` có placeholder, `.env` được `.gitignore`
loại trừ và không có file `.env` được Git theo dõi. Không thực hiện audit
secret toàn bộ lịch sử Git.

Không sửa frontend trong lượt này, không thêm dependency, không thay đổi
schema database hoặc workflow nghiệp vụ. Chưa tạo commit.
