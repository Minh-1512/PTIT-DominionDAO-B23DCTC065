# Tạm dừng và mở lại

- Bấm đúp `Tam_dung_du_an.cmd`: lưu các giao dịch local trước khi dừng web và blockchain.
- Bấm đúp `Mo_lai_du_an.cmd`: mở blockchain, phát lại các giao dịch đã lưu, kiểm tra khớp số dư và đề xuất, rồi mở web.
- MetaMask: vào menu ba gạch, chọn Khóa. Lần sau mở lại bằng mật khẩu, chọn tài khoản thực hành và mạng Localhost 8545.
- Có thể đóng tab web sau khi tạm dừng. Không cần xóa tài khoản hay gỡ MetaMask.

Dữ liệu được lưu tại `local-session/snapshot.json`, gồm giao dịch đã ký của mạng local, số dư đối chiếu và đề xuất. Giữ file này cùng toàn bộ dự án. Không deploy lại khi muốn tiếp tục phiên đã lưu. Đừng chỉ tắt nguồn máy khi có giao dịch mới chưa lưu; chạy tệp tạm dừng trước để lưu phiên mới nhất.

Chỉ dùng các tệp này với dự án thực hành local. Bản lưu không chứa mật khẩu hoặc cụm từ khôi phục MetaMask.
