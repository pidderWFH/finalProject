// import  axios  from "axios"
const api_path="travel";
// const token="VGAWyx4NZJdA8ftE3n6wsd3k7M32";
const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect")
const cartList = document.querySelector(".shoppingCart-tableList");
let productData = [];
let cartData = [];
function init() {
    getProductList();
    getCartList();
}
init();
async function getProductList() {
   await axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function(respnose){
        productData = respnose.data.products;
        renderProductList();
    })
}

function mergeHTMLItem(item){
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="js-addCart" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>`;
}

function renderProductList() {
    let str = "";
    productData.forEach(function(item){
        str+= mergeHTMLItem(item);
    }) 
    productList.innerHTML = str;
}

productSelect.addEventListener("change", function(e){
    const category = e.target.value;
    if(category == "全部"){
        renderProductList();
        return;
    }
    let str = "";
    productData.forEach(function(item){
        if(item.category == category){
            str+= mergeHTMLItem(item);
        }
        productList.innerHTML = str;
    })
})

productList.addEventListener("click", function(e){
    e.preventDefault();
    let addCartClass = e.target.getAttribute("class");
    if(addCartClass !== "js-addCart"){
        return;
    }
    let productId = e.target.getAttribute("data-id");
    // console.log(productId);

    //若有品項+1 若無新增
    let numCheck = 1;
    cartData.forEach(function(item){
        if(item.product.id === productId){
            numCheck = item.quantity+= 1;
        }
    })

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    }).then(function(respnose){
        alert("加入購物車");
        getCartList();
    })
})

function getCartList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then (function (respnose){
        document.querySelector(".js-total").textContent = toThousands(respnose.data.finalTotal);
        cartData = respnose.data.carts;
        let str ="";
        // console.log(cartData.length);
        let cartDataItem = cartData.length;
        if(cartDataItem === 0){
            str += `<p>購物車目前是空的</p>`;
        }else{
            cartData.forEach(function(item){
                str += `<tr>
                    <td>
                        <div class="cardItem-title">
                            <img src="${item.product.images}" alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${toThousands(item.product.price)}</td>
                    <td>${item.quantity}</td>
                    <td>NT$${toThousands(item.product.price * item.quantity)}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-id="${item.id}">
                            clear
                        </a>
                    </td>
                </tr>`
            });
        }
        cartList.innerHTML = str;
        
    })
}
//刪除一項購物車
cartList.addEventListener("click", function(e){
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id");
    if (cartId == null){
        return;
    }
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(respnose){
        getCartList();
    })
})
//刪除全部購物車
const discartAllBtn = document.querySelector(".discardAllBtn");
discartAllBtn.addEventListener("click", function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(respnose){
        alert("刪除全部成功")
        getCartList();
    })
    .catch(function(response){
        alert("購物車已清空");
    })
})

//送出訂單
const orderInfobtn = document.querySelector(".orderInfo-btn");
orderInfobtn.addEventListener("click", function(e){
    e.preventDefault();
    if (cartData.length == 0){
        alert("請加入購物車");
        return;
    }
    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const customerTradeWay = document.querySelector("#tradeWay").value;

    if (customerName=="" || customerPhone=="" || customerEmail=="" || customerAddress=="" || customerTradeWay==""){
        alert("請輸入訂單資訊");
        return;
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": customerTradeWay
            }
          }
    }).then(function(respnose){
        alert("訂單建立成功");
        document.querySelector("#customerName").value="";
        document.querySelector("#customerPhone").value="";
        document.querySelector("#customerEmail").value="";
        document.querySelector("#customerAddress").value="";
        document.querySelector("#tradeWay").value="ATM";
        getCartList();
    })
})

//util js
function toThousands(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");
    return parts.join(".");
}

// validate js
const inputs = document.querySelectorAll("input[name],select[data=payment]");
const form = document.querySelector(".orderInfo-form");
const constraints = {
  "姓名": {
    presence: {
      message: "必填欄位"
    }
  },
  "電話": {
    presence: {
      message: "必填欄位"
    },
    length: {
      minimum: 8,
      message: "需超過 8 碼"
    }
  },
  "Email": {
    presence: {
      message: "必填欄位"
    },
    email: {
      message: "格式錯誤"
    }
  },
  "寄送地址": {
    presence: {
      message: "必填欄位"
    }
  },
  "交易方式": {
    presence: {
      message: "必填欄位"
    }
  },
};


inputs.forEach((item) => {
  item.addEventListener("change", function () {
    
    item.nextElementSibling.textContent = '';
    let errors = validate(form, constraints) || '';
    console.log(errors)

    if (errors) {
      Object.keys(errors).forEach(function (keys) {
        // console.log(document.querySelector(`[data-message=${keys}]`))
        document.querySelector(`[data-message="${keys}"]`).textContent = errors[keys];
      })
    }
  });
});