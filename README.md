# DominionDAO PTIT

Bài thực hành Smart Contract và React của Nguyễn Quang Minh — B23DCTC065.

Ứng dụng cho phép góp ETH, cấp quyền cổ đông khi đóng góp đạt 0.01 ETH, tạo đề xuất, bỏ phiếu và thanh toán sau 5 phút. Mỗi địa chỉ chỉ bỏ một phiếu cho mỗi đề xuất; đề xuất được thanh toán khi số đồng ý lớn hơn số từ chối và quỹ đủ tiền.

## Kết quả Sepolia

- Chain ID: `11155111`.
- DominionDAO: `0x63a83d05452b313338B0992D11d49e0C60ECf019`.
- FirstSmartContract: `0xc506f461D6365Fc65c4285552F6FbD3881aa4462`; giá trị đọc lại: `500000000`.
- Ba tài khoản đóng góp tổng `0.03 ETH`; đề xuất số 0 có `2 đồng ý / 1 từ chối`.
- Quỹ thanh toán `0.005 ETH` cho `0x6F8b99C4Cb8Cd288058974E63f5485e7e54F037d`, còn `0.025 ETH` tại thời điểm kiểm tra.
- Dữ liệu đối chiếu: [evidence/sepolia-state.json](evidence/sepolia-state.json).
- [Báo cáo Word](Bao_cao_Blockchain_Nguyen_Quang_Minh_B23DCTC065_cap_nhat_Sepolia.docx).
- [Ảnh minh chứng Sepolia](evidence/anh_sepolia_bao_cao).

## Cài đặt và kiểm tra

Cần Node.js và npm; MetaMask dùng khi thao tác qua trình duyệt.

```sh
npm ci
npm test
npm run build
npm run dev
```

Mở `http://localhost:3000/practice.html`, chọn Ethereum Sepolia, kết nối ví. Trong mục chọn contract chung, nhập địa chỉ DominionDAO phía trên, bấm Sử dụng contract chung rồi Mở DAO trên Sepolia. Không cần triển khai lại contract đã có. Các thao tác ghi cần Sepolia ETH và người dùng xác nhận trong MetaMask. Giao diện chạy trên máy người xem; link GitHub là mã nguồn, không phải website đã được lưu trữ trực tuyến.

## Chạy blockchain local

Mở ba cửa sổ terminal tại thư mục dự án:

```sh
# Cửa sổ 1
npm run chain
# Cửa sổ 2
npm run deploy:local
# Cửa sổ 3
npm run dev
```

MetaMask dùng mạng Localhost 8545, RPC `http://127.0.0.1:8545`, Chain ID `31337`, ký hiệu ETH. Chỉ dùng tài khoản Hardhat trên mạng local. `npm run demo` chạy luồng kiểm chứng trên blockchain tạm riêng, không sửa trạng thái Sepolia.

## Bản React 17 và Web3

```sh
npm --prefix web3-app ci
npm run build:web3
npm run dev:web3
```

Mở `http://localhost:3001`. Đây là bản React 17, Create React App, react-app-rewired và Web3; cấu hình mặc định nối contract local. Giao diện chính ở cổng 3000 dùng React 18, Vite và ethers, hỗ trợ local cùng Sepolia.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| contracts | FirstSmartContract, DominionDAO và token USDT mẫu |
| remix | Solidity gộp thư viện để nhập vào Remix |
| test | Kiểm thử chức năng và điều kiện từ chối |
| scripts | Triển khai, xuất ABI, kiểm tra trạng thái và lưu phiên local |
| web | Giao diện React chính và trang hướng dẫn Remix Sepolia |
| web3-app | Bản React 17 và Web3 |
| evidence | Dữ liệu kiểm tra và ảnh minh chứng |

Contract dựa trên [mã mẫu giảng viên](https://github.com/VuManh-07/CodeSmartcontractThucHanhPtit). Phiên bản này bổ sung kiểm tra đầu vào, thời hạn thanh toán, tồn tại đề xuất và ReentrancyGuard. Token mẫu chỉ phục vụ thực hành.

Không đưa private key, cụm từ khôi phục hay file `.env` lên GitHub. Có thể cấu hình triển khai qua `.env.example`; triển khai qua MetaMask trên trang thực hành không cần nhập private key vào dự án. Sáu kiểm thử contract cùng hai bản web đã được kiểm tra thành công trên máy thực hành.

