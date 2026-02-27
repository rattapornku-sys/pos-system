// ระบบ Login
let isLoggedIn = false;
let systemPassword = localStorage.getItem('systemPassword') || '1234';

// ตรวจสอบการ Login
function checkLogin() {
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
        isLoggedIn = true;
        showPOS();
    }
}

// Login
function login() {
    const password = document.getElementById('passwordInput').value;
    
    if (password === systemPassword) {
        isLoggedIn = true;
        sessionStorage.setItem('isLoggedIn', 'true');
        showPOS();
    } else {
        alert('รหัสผ่านไม่ถูกต้อง');
        document.getElementById('passwordInput').value = '';
    }
}

// แสดงหน้า POS
function showPOS() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('posContainer').style.display = 'block';
}

// Logout
function logout() {
    if (confirm('ต้องการออกจากระบบหรือไม่?')) {
        isLoggedIn = false;
        sessionStorage.removeItem('isLoggedIn');
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('posContainer').style.display = 'none';
        document.getElementById('passwordInput').value = '';
    }
}

// แสดงหน้าเปลี่ยนรหัสผ่าน
function showPasswordManager() {
    document.getElementById('passwordModal').style.display = 'block';
}

// เปลี่ยนรหัสผ่าน
function changePassword() {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!oldPassword || !newPassword || !confirmPassword) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    if (oldPassword !== systemPassword) {
        alert('รหัสผ่านเดิมไม่ถูกต้อง');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('รหัสผ่านใหม่ไม่ตรงกัน');
        return;
    }
    
    if (newPassword.length < 4) {
        alert('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
        return;
    }
    
    systemPassword = newPassword;
    localStorage.setItem('systemPassword', newPassword);
    
    alert('เปลี่ยนรหัสผ่านสำเร็จ!');
    
    document.getElementById('oldPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    closeModal('passwordModal');
}

// กด Enter เพื่อ Login
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});

// ข้อมูลเมนู
let menu = [
    { id: 1, name: 'น้ำเปล่า', price: 10 },
    { id: 2, name: 'โค้ก', price: 15 },
    { id: 3, name: 'เป๊ปซี่', price: 15 },
    { id: 4, name: 'น้ำส้ม', price: 20 },
    { id: 5, name: 'กาแฟเย็น', price: 25 },
    { id: 6, name: 'ชาเย็น', price: 20 },
    { id: 7, name: 'นมสด', price: 20 },
    { id: 8, name: 'น้ำแดง', price: 15 }
];

// ตะกร้าสินค้า
let cart = [];

// ประวัติการขาย
let salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];

// โหลดข้อมูลเมนูจาก localStorage
function loadMenu() {
    const savedMenu = localStorage.getItem('menu');
    if (savedMenu) {
        menu = JSON.parse(savedMenu);
    }
}

// บันทึกเมนูลง localStorage
function saveMenu() {
    localStorage.setItem('menu', JSON.stringify(menu));
}

// แสดงเมนู
function renderMenu() {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = menu.map(item => `
        <div class="menu-item" onclick="addToCart(${item.id})">
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-price">฿${item.price}</div>
        </div>
    `).join('');
}

// เพิ่มสินค้าลงตะกร้า
function addToCart(itemId) {
    const menuItem = menu.find(m => m.id === itemId);
    if (!menuItem) return;

    const existingItem = cart.find(c => c.id === itemId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...menuItem, quantity: 1 });
    }
    
    renderCart();
    updateTotal();
}

// แสดงตะกร้า
function renderCart() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">ยังไม่มีรายการสั่งซื้อ</p>';
        return;
    }
    
    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">฿${item.price} x ${item.quantity}</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="decreaseQty(${index})">-</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" onclick="increaseQty(${index})">+</button>
                <button class="btn-remove" onclick="removeFromCart(${index})">ลบ</button>
            </div>
        </div>
    `).join('');
}

// เพิ่มจำนวน
function increaseQty(index) {
    cart[index].quantity++;
    renderCart();
    updateTotal();
}

// ลดจำนวน
function decreaseQty(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        cart.splice(index, 1);
    }
    renderCart();
    updateTotal();
}

// ลบสินค้า
function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateTotal();
}

// ล้างตะกร้า
function clearCart() {
    if (cart.length === 0) return;
    if (confirm('ต้องการล้างรายการทั้งหมดหรือไม่?')) {
        cart = [];
        renderCart();
        updateTotal();
        document.getElementById('receivedAmount').value = '';
        document.getElementById('changeAmount').textContent = '฿0';
    }
}

// อัพเดทยอดรวม
function updateTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('totalAmount').textContent = `฿${total}`;
    calculateChange();
}

// คำนวณเงินทอน
function calculateChange() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const received = parseFloat(document.getElementById('receivedAmount').value) || 0;
    const change = received - total;
    document.getElementById('changeAmount').textContent = `฿${change >= 0 ? change : 0}`;
}

// ชำระเงิน
function checkout() {
    if (cart.length === 0) {
        alert('กรุณาเลือกสินค้าก่อนชำระเงิน');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const received = parseFloat(document.getElementById('receivedAmount').value) || 0;
    
    if (received < total) {
        alert('จำนวนเงินที่รับไม่เพียงพอ');
        return;
    }
    
    const change = received - total;
    
    // บันทึกประวัติการขาย
    const sale = {
        id: Date.now(),
        date: new Date().toLocaleString('th-TH'),
        items: [...cart],
        total,
        received,
        change
    };
    
    salesHistory.push(sale);
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    
    // แสดงใบเสร็จ
    showReceipt(sale);
    
    // ล้างตะกร้า
    cart = [];
    renderCart();
    updateTotal();
    document.getElementById('receivedAmount').value = '';
}

// แสดงใบเสร็จ
function showReceipt(sale) {
    const receiptContent = document.getElementById('receiptContent');
    
    const itemsHtml = sale.items.map(item => `
        <div class="receipt-item">
            <span>${item.name} x${item.quantity}</span>
            <span>฿${item.price * item.quantity}</span>
        </div>
    `).join('');
    
    receiptContent.innerHTML = `
        <div class="receipt-header">
            <h3>🥤 ร้านขายน้ำ</h3>
            <p>ใบเสร็จรับเงิน</p>
        </div>
        <div class="receipt-info">
            <p>เลขที่: ${sale.id}</p>
            <p>วันที่: ${sale.date}</p>
        </div>
        <div class="receipt-items">
            ${itemsHtml}
        </div>
        <div class="receipt-total">
            <div class="receipt-row">
                <span>รวมทั้งหมด:</span>
                <span>฿${sale.total}</span>
            </div>
            <div class="receipt-row">
                <span>รับเงิน:</span>
                <span>฿${sale.received}</span>
            </div>
            <div class="receipt-row total">
                <span>เงินทอน:</span>
                <span>฿${sale.change}</span>
            </div>
        </div>
        <div class="receipt-footer">
            <p>ขอบคุณที่ใช้บริการ</p>
            <p>โปรดตรวจสอบสินค้าก่อนออกจากร้าน</p>
        </div>
    `;
    
    document.getElementById('receiptModal').style.display = 'block';
}

// พิมพ์ใบเสร็จ
function printReceipt() {
    window.print();
}

// แสดงรายงานยอดขาย
function showSalesReport() {
    const totalSales = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = salesHistory.length;
    const avgSale = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;
    
    const salesTable = salesHistory.slice().reverse().map(sale => `
        <tr>
            <td>${sale.id}</td>
            <td>${sale.date}</td>
            <td>${sale.items.length}</td>
            <td>฿${sale.total}</td>
        </tr>
    `).join('');
    
    const reportHtml = `
        <div class="sales-summary">
            <div class="sales-card">
                <div class="sales-card-label">ยอดขายรวม</div>
                <div class="sales-card-value">฿${totalSales}</div>
            </div>
            <div class="sales-card">
                <div class="sales-card-label">จำนวนบิล</div>
                <div class="sales-card-value">${totalOrders}</div>
            </div>
            <div class="sales-card">
                <div class="sales-card-label">ยอดเฉลี่ย/บิล</div>
                <div class="sales-card-value">฿${avgSale}</div>
            </div>
        </div>
        <h3>ประวัติการขาย</h3>
        <table class="sales-table">
            <thead>
                <tr>
                    <th>เลขที่</th>
                    <th>วันที่</th>
                    <th>รายการ</th>
                    <th>ยอดรวม</th>
                </tr>
            </thead>
            <tbody>
                ${salesTable || '<tr><td colspan="4" style="text-align:center">ยังไม่มีประวัติการขาย</td></tr>'}
            </tbody>
        </table>
    `;
    
    document.getElementById('salesReport').innerHTML = reportHtml;
    document.getElementById('salesModal').style.display = 'block';
}

// แสดงหน้าจัดการเมนู
function showMenuManager() {
    renderMenuList();
    document.getElementById('menuModal').style.display = 'block';
}

// แสดงรายการเมนูทั้งหมด
function renderMenuList() {
    const menuList = document.getElementById('menuList');
    menuList.innerHTML = menu.map(item => `
        <div class="menu-list-item">
            <div class="menu-list-item-info">
                <div class="menu-list-item-name">${item.name}</div>
                <div class="menu-list-item-price">฿${item.price}</div>
            </div>
            <button class="btn-remove" onclick="deleteMenu(${item.id})">ลบ</button>
        </div>
    `).join('');
}

// เพิ่มเมนูใหม่
function addMenu() {
    const name = document.getElementById('newMenuName').value.trim();
    const price = parseFloat(document.getElementById('newMenuPrice').value);
    
    if (!name || !price || price <= 0) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }
    
    const newId = menu.length > 0 ? Math.max(...menu.map(m => m.id)) + 1 : 1;
    menu.push({ id: newId, name, price });
    
    saveMenu();
    renderMenu();
    renderMenuList();
    
    document.getElementById('newMenuName').value = '';
    document.getElementById('newMenuPrice').value = '';
    
    alert('เพิ่มเมนูสำเร็จ!');
}

// ลบเมนู
function deleteMenu(id) {
    if (!confirm('ต้องการลบเมนูนี้หรือไม่?')) return;
    
    menu = menu.filter(m => m.id !== id);
    saveMenu();
    renderMenu();
    renderMenuList();
}

// ปิด Modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Event Listeners
document.getElementById('receivedAmount').addEventListener('input', calculateChange);

// เริ่มต้น
checkLogin();
loadMenu();
renderMenu();
renderCart();
