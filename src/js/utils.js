// 获取当前cookie
function getCookie(cookieName) {
  let cookieValue = "";
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].split("=");
      if (cookie[0].trim() === cookieName.trim()) {
        cookieValue = cookie[1].trim();
        break;
      }
    }
  }
  return cookieValue;
}

/**
 * @description 获取本地query内容
 * @param {*} name
 * @returns {返回内容}
 */
function getQueryParam(name) {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  return params.get(name);
}

/**
 * @param {请求地址} url
 * @param {请求方法} type
 * @param {请求头配置} headers
 * @param {发送到服务器的数据} data
 * @param {请求成功} successCallback
 * @param {请求失败} errorCallback
 */
function request(
  url = "",
  type = "GET",
  headers = {},
  data = {},
  successCallback = function (data) {
    // 默认成功回调函数，这里什么都不做
  },
  errorCallback = function (jqXHR, textStatus, errorThrown) {
    // 默认错误回调函数，打印错误信息
    console.error("Error: " + textStatus, errorThrown);
  }
) {
  // 用于sso登录判断的token
  // const SSOTOKEN = getCookie("SSO-TOKEN");
  // if (SSOTOKEN) {
  //   headers["SSO-TOKEN"] = "bearer " + SSOTOKEN;
  // }

  // 用于验证码判断的token
  const loginToken = localStorage.getItem("login-token");
  if (loginToken) {
    headers["login-token"] = loginToken;
  }

  $.ajax({
    url: url,
    type,
    headers,
    data,
    dataType: "json",
    success: (res) => {
      if (res.code === "00000") {
        res.successful = true;
      } else {
        Message(res.msg, 4000);
        res.successful = false;
      }
      successCallback(res);
    },
    error: errorCallback,
  });
}

/**
 * @description 初始化页面 获取token与相应的验证码图片
 * @param {是否初始化} isInit
 */
const initPage = () => {
  request(
    "SSO/getLogingToken",
    "POST",
    {},
    {
      redirectUrl: redirectUrl,
      prevToken: localStorage.getItem("login-token") || "",
    },
    (res) => {
      if (res.successful) {
        // console.log("res", res);
        if (res.data.ticket && res.data.url) {
          // 已登录的特殊情况，直接回跳原url
          window.location.href = `${res.data.url}?ticket=${res.data.ticket}`;
        } else if (redirectUrl) {
          // 初次进入，将跳转网页存储
          window.location.href = window.location.origin + window.location.pathname; 
        } else {
          $(".svgContainer").html(res.data.svg);
        }
        if (res.data.loginingToken) {
          localStorage.setItem("login-token", res.data.loginingToken);
        }
      }
    }
  );
};

/**
 * @description 获取短信token
 */
const getPhoneToken = (phone, isMobile) => {
  request(
    "SSO/phone/postCaptcha",
    "GET",
    {},
    {
      phone,
    },
    function (res) {
      if (res.successful) {
        // 更新本地token
        localStorage.setItem("login-token", res.data.loginingToken);
        Message("验证码已发送！", 4000);
        let selector;
        if (isMobile) {
          selector = "#mobile_back .verificationCode button";
        } else {
          selector = "#pc_back .phoneLogin .phoneVerificationCode button";
        }
        let time = 60;
        timer = setInterval(function () {
          if (time === 0) {
            $(selector).html("发送验证码");
            $(selector).removeClass("countDown");
            time = 60;
            clearInterval(timer);
            // initPage();
          } else {
            $(selector).html(time + "秒后重新获取");
            time--;
            $(selector).addClass("countDown");
          }
        }, 1000);
      }
    },
    function () {
      // initPage();
    }
  );
};

// 校验账号密码格式
function isValidInput(input) {
  // 正则表达式，只允许英文字母（大小写）、英文标点符号、数字，并且长度在6到12个字符之间
  const regex = /^[a-zA-Z0-9!'#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~ ]{6,12}$/;
  // 使用正则表达式检查输入
  return regex.test(input);
}

// 校验手机号格式
function isValidPhoneNumber(phoneNumber) {
  const pattern = /^1[3-9]\d{9}$/;
  return pattern.test(phoneNumber);
}

/**
 * 设备判断
 */
function isUserMobile() {
  const ua = navigator.userAgent.toLowerCase();
  return /mobile|android|iphone|ipod|phone|ipad/i.test(ua);
}

/**
 * 动态计算rem
 */
function getCurrentRem() {
  function setRemFontSize() {
    const clientWidth =
      window.innerWidth || document.documentElement.clientWidth;
    const remSize = (clientWidth / 1000) * 10;
    console.log("remSize", remSize);
    document.documentElement.style.fontSize = remSize + "px";
  }
  // 初始化设置
  setRemFontSize();
  // 监听窗口大小变化
  window.addEventListener("resize", setRemFontSize);
}
