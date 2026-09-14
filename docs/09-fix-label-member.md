AI Usage Log — Members & Labels Dynamic Management
Feature: Nâng cấp Members & Labels từ static → dynamic
Ngày thực hiện: 14/09/2026
AI tool: ide gravity (Gemini 3.1 Pro)
Human review: Trần Thị Tố Như

Task 5.1 — Mở rộng mockApi.js với CRUD cho Members & Labels
AI tool: ide gravity (Gemini 3.1 Pro)

AI Generated:

Thêm 2 STORAGE_KEYS: MEMBERS, LABELS

Thêm initialLabelsData — seed labels với id + color

Thêm inMemoryStorage.members và inMemoryStorage.labels

Thêm 10 method mới:

getMembers(), createMember(), updateMember(), deleteMember()

getLabels(), createLabel(), updateLabel(), deleteLabel()

getLabelByName(), normalizeLabelName()

Update resetMockData() bao gồm cả members và labels

Human review: Trần Thị Tố Như

So sánh trước → sau:

Trước	Sau
Chỉ có PROJECTS, TASKS, STUDENTS	Thêm MEMBERS, LABELS
resetMockData chỉ reset 3 collection	Reset cả 5 collection
Không có CRUD cho members/labels	Có đầy đủ CRUD + cascade delete
Không có validation	Validate name/mssv/email/trùng label
Kiểm tra validation trong createMember:

Name: required, ≥ 2 ký tự ✅

MSSV: required, không trùng ✅

Email: required, đúng format regex ✅

Kiểm tra validation trong createLabel:

Name: required, ≥ 2 ký tự ✅

Chuẩn hóa name qua normalizeLabelName (trim + collapse spaces) ✅

Kiểm tra trùng case-insensitive qua findLabelByName ✅

Kiểm tra cascade delete:

deleteMember: xóa memberId khỏi assigneeIds của tất cả tasks ✅

deleteLabel: xóa label name khỏi labels array của tất cả tasks ✅

Test 6 case:

createMember với MSSV trùng → báo lỗi đúng ✅

createLabel với name trùng khác case → báo lỗi đúng ✅

deleteMember → memberId bị xóa khỏi tasks ✅

deleteLabel → label name bị xóa khỏi tasks ✅

getMembers sau reset → trả 3 members mặc định ✅

getLabels sau reset → trả 7 labels mặc định ✅

Trạng thái: ✅ Đã review

Task 5.2 — Cập nhật constants.js với helper functions
AI tool: ide gravity (Gemini 3.1 Pro)

AI Generated:

Đổi tên PREDEFINED_MEMBERS → INITIAL_MEMBERS

Đổi tên PREDEFINED_LABELS → INITIAL_LABELS

Giữ alias cũ để backward-compatible

Thêm normalizeLabelName(name) — trim + collapse spaces

Thêm labelsAreEqual(a, b) — so sánh case-insensitive

Thêm findLabelByName(labelsList, name) — tìm label theo name

Human review: Trần Thị Tố Như

So sánh trước → sau:

Trước	Sau
PREDEFINED_MEMBERS (tên gợi ý "cố định")	INITIAL_MEMBERS + alias cũ
PREDEFINED_LABELS (array of string)	INITIAL_LABELS + alias cũ
Không có helper normalize	Có normalizeLabelName, labelsAreEqual, findLabelByName
Kiểm tra normalizeLabelName:

" ui/ux " → "ui/ux" ✅

"UI / UX" → "UI / UX" (collapse spaces) ✅

"" → "" ✅

Kiểm tra labelsAreEqual:

"UI/UX" vs "ui/ux" → true ✅

"Frontend" vs "frontend" → true ✅

Kiểm tra findLabelByName:

Handle null/undefined input ✅

Trả null nếu không tìm thấy ✅

Test 5 case:

Normalize " Bug " → "Bug" ✅

labelsAreEqual("UI/UX", "ui/ux") → true ✅

labelsAreEqual("Bug", "Backend") → false ✅

findLabelByName([...], "frontend") → tìm thấy "Frontend" ✅

findLabelByName(null, "x") → null ✅

Trạng thái: ✅ Đã review

Task 5.3 — Tạo trang Settings + thêm route
AI tool: ide gravity (Gemini 3.1 Pro)

AI Generated:

src/pages/Settings.jsx — trang quản lý Members & Labels với 2 tab

src/styles/Settings.css — style theo Jira theme

Update App.jsx — thêm route /settings

Update Navbar.jsx — thêm NavLink "⚙️ Settings"

Human review: Trần Thị Tố Như

So sánh trước → sau:

App.jsx:

Trước	Sau
Không có import Settings	import Settings from "./pages/Settings"
Không có route /settings	<Route path="/settings" element={<Settings />} />
Navbar.jsx:

Trước	Sau
Chỉ có link Dashboard	Thêm <NavLink to="/settings">⚙️ Settings</NavLink>
Settings.jsx — cấu trúc:

State: activeTab, members, labels, loading, toast, editingMember, editingLabel, isAddingMember, isAddingLabel

Tab switcher giữa Members và Labels

Table hiển thị members/labels với actions ✏️ ❌

Form add/edit inline

Confirm dialog cho delete (không dùng window.confirm)

Kiểm tra form validation:

Member: name ≥ 2, mssv required, email format ✅

Label: name ≥ 2, không trùng ✅

Kiểm tra confirm dialog:

Member: "This will remove them from all tasks" ✅

Label: "removed from N tasks" ✅

Test 8 case:

Vào /settings → thấy 2 tab ✅

Tab Members → thấy 3 members mặc định ✅

Click "+ Add Member" → form hiện ✅

Điền form + Save → member mới xuất hiện ✅

Click ✏️ Edit → sửa name → Save → cập nhật ✅

Click ❌ Delete → confirm dialog → xóa ✅

Tab Labels → thấy 7 labels mặc định ✅

Click "+ Add Label" → điền → Save → label mới ✅

Phát hiện vấn đề: Tab switcher chưa sync với location.state.tab khi navigate từ "Manage" link. Đã ghi chú để bổ sung.

Trạng thái: ✏️ Đã ghi chú cải tiến

Task 5.4 — Cập nhật CreateTask.jsx dùng Members & Labels động
AI tool: ide gravity (Gemini 3.1 Pro)

AI Generated:

Xóa import PREDEFINED_MEMBERS, PREDEFINED_LABELS

Thêm state members, labels

Đổi useEffect từ getStudents() → Promise.all([getMembers(), getLabels()])

Đổi students.map → members.map trong popup

Đổi PREDEFINED_LABELS.map → labels.map trong popup

Label object dùng labelObj.name và labelObj.color

Thêm "⚙️ Manage Members" và "⚙️ Manage Labels" ở footer popup

Human review: Trần Thị Tố Như

So sánh trước → sau:

Trước	Sau
import { PREDEFINED_MEMBERS, PREDEFINED_LABELS, getLabelColor }	import { getLabelColor }
const [students, setStudents] = useState(PREDEFINED_MEMBERS)	const [members, setMembers] = useState([]) + labels state
mockApi.getStudents()	Promise.all([mockApi.getMembers(), mockApi.getLabels()])
students.map(member => ...)	members.map(member => ...)
PREDEFINED_LABELS.map(label => ...)	labels.map(labelObj => ...)
background: getLabelColor(label)	background: labelObj.color || getLabelColor(labelName)
Không có link manage	Có <Link to="/settings" state={{ tab: "members" }}>
Kiểm tra popup Members:

members.map(member => ...) ✅

Checkbox checked dựa trên values.assigneeIds.includes(member.id) ✅

Hiển thị member.name + member.mssv ✅

Kiểm tra popup Labels:

labels.map(labelObj => ...) ✅

Checkbox checked dựa trên values.labels.includes(labelName) ✅

Background: labelObj.color || getLabelColor(labelName) ✅

Kiểm tra selected chips:

Member chip: tìm trong members array ✅

Label chip: tìm label object theo name (case-insensitive) → dùng color ✅

Test 5 case:

Thêm member ở Settings → vào CreateTask → thấy member đó trong popup ✅

Thêm label → thấy label đó trong popup ✅

Chọn member → chip hiển thị đúng tên ✅

Chọn label → chip hiển thị đúng màu ✅

Click "Manage Members" → navigate tới /settings với tab members ✅

Trạng thái: ✅ Đã review

Task 5.5 — Cập nhật TaskDetail.jsx dùng Members & Labels động
AI tool: ide gravity (Gemini 3.1 Pro)

AI Generated:

Xóa import PREDEFINED_MEMBERS, PREDEFINED_LABELS

Thêm state members, labels

Update useEffect fetch getTaskById, getMembers, getLabels

Đổi PREDEFINED_MEMBERS.map → members.map trong sidebar popup

Đổi PREDEFINED_LABELS.map → labels.map trong sidebar popup

Update helper getStudentName dùng members array

Label badges trong Quick Info dùng labelObj.color

Thêm "Manage" link ở footer popup

Human review: Trần Thị Tố Như

So sánh trước → sau:

Trước	Sau
import { PREDEFINED_MEMBERS, PREDEFINED_LABELS, getLabelColor, getStudentName }	import { getLabelColor, getStudentName as getStudentNameHelper }
const [students, setStudents] = useState([])	const [members, setMembers] = useState([]) + labels state
Promise.all([getTaskById, getStudents])	Promise.all([getTaskById, getMembers, getLabels])
PREDEFINED_MEMBERS.map(member => ...)	members.map(member => ...)
PREDEFINED_LABELS.map(label => ...)	labels.map(labelObj => ...)
getStudentNameHelper(students, id)	getStudentNameHelper(members, id)
style={{ background: getLabelColor(l) }}	style={{ background: labelObj?.color || getLabelColor(l) }}
Không có link manage	Có <Link to="/settings" state={{ tab: "members" }}>
Kiểm tra sidebar popup Members:

members.map(member => ...) ✅

Hiển thị avatar + name + mssv ✅

Checkbox checked dựa trên task.assigneeIds.includes(member.id) ✅

Kiểm tra sidebar popup Labels:

labels.map(labelObj => ...) ✅

Checkbox checked dựa trên task.labels.includes(labelName) ✅

Kiểm tra helper getStudentName:

Tìm trong members array ✅

Fallback về id nếu không tìm thấy ✅

Kiểm tra label badge trong Quick Info:

task.labels.map(l => ...) ✅

Tìm label object theo name → dùng color ✅

Fallback getLabelColor(l) nếu không tìm thấy ✅

Test 6 case:

Thêm member mới → TaskDetail popup thấy member đó ✅

Xóa member ở Settings → TaskDetail popup không còn ✅

Thêm label mới → TaskDetail popup thấy ✅

Xóa label → TaskDetail popup không còn ✅

Task có label "Frontend" → hiển thị đúng màu ✅

Click "Manage Labels" → navigate tới /settings tab labels ✅

Trạng thái: ✅ Đã review

Task 5.6 — Cập nhật TaskList.jsx dùng Members động
AI tool: ide gravity (Gemini 3.1 Pro)

AI Generated:

Xóa import PREDEFINED_MEMBERS

Thêm state members

Update useEffect fetch getMembers()

Đổi helper getStudent tìm trong members array

Human review: Trần Thị Tố Như

So sánh trước → sau:

Trước	Sau
import { PREDEFINED_MEMBERS, getLabelColor }	import { getLabelColor }
const [students, setStudents] = useState(PREDEFINED_MEMBERS)	const [members, setMembers] = useState([])
Promise.all([getTasks, getStudents])	Promise.all([getTasks, getMembers])
students.find((s) => s.id === id) || PREDEFINED_MEMBERS.find(...)	members.find((s) => s.id === id)
Kiểm tra useEffect:

Promise.all fetch tasks + members song song ✅

Kiểm tra helper getStudent:

Tìm trong members array ✅

Fallback về { id, name: id } ✅

Kiểm tra avatar member trên task card:

Hiển thị chữ cái đầu của tên cuối ✅

Tooltip: name (mssv) ✅

Test 4 case:

Xóa member ở Settings → task card không còn avatar đó ✅

Thêm member mới → assign vào task → task card có avatar ✅

Task có 2 members → hiển thị 2 avatar ✅

Task không có member → không hiển thị gì ✅

Trạng thái: ✅ Đã review