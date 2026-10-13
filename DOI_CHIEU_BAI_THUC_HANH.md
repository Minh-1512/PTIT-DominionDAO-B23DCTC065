# Đối chiếu kết quả thực hành

- FirstSmartContract trên Remix và Sepolia: địa chỉ 0xc506f461D6365Fc65c4285552F6FbD3881aa4462, setBalance và getBalance cho kết quả 500000000.
- DominionDAO trên local: góp 0.03 ETH, 2 phiếu đồng ý, 1 từ chối, thanh toán 0.005 ETH, quỹ còn 0.025 ETH.
- DominionDAO trên Sepolia: 0x63a83d05452b313338B0992D11d49e0C60ECf019; cùng luồng đã thực hiện bằng Account 1–4. Account 4 có số dư ban đầu 0 ETH, sau nhận 0.005 ETH. Chi tiết trong evidence/sepolia-state.json.
- React với Vite và ethers, cùng bản React 17 CRA Web3: đã biên dịch thành công.
- Sáu kiểm thử contract đạt. Token mẫu được triển khai và kiểm tra trên local.
- Báo cáo Word đã bổ sung 5 ảnh Sepolia được chọn và giữ minh chứng local.

Luồng nhiều tài khoản xác nhận chức năng của contract. Số tài khoản không phải bằng chứng số người điều khiển; việc xác nhận thành viên tham gia thuộc phần tổ chức thực hành.
