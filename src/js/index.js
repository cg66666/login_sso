/*
 * @Description: file content
 * @Author: 朱晨光
 * @Date: 2024-05-04 16:11:15
 * @LastEditors: cg
 * @LastEditTime: 2024-10-15 17:48:17
 */
const redirectUrl = getQueryParam("redirectUrl");
initPage();

// 更新验证码
$(".svgContainer").on("click", function () {
  initPage();
});

// 所有输入框禁止中文
$("input").on("input", function (e) {
  // console.log('value',e.target.value);
  e.target.value = e.target.value.replace(/[\u4e00-\u9fa5]/g, "");
});

// pc端js内容
if (!isUserMobile()) {
  $("#mobile_back").remove();
  // 倒计时控制器
  let timer;
  // 重置账号密码表单
  function resetLoginPassword() {
    $(".passwordLogin #accountInput").val("");
    $(".passwordLogin #passwordInput").val("");
    $(".passwordLogin .verificationCode input").val("");
    $(".passwordRegistry #accountInput").val("");
    $(".passwordRegistry #passwordInput").val("");
    $(".passwordRegistry .verificationCode input").val("");
    $("#loginContain #switchIcon").children("img").eq(0).addClass("showIcon");
    $("#loginContain #switchIcon")
      .children("img")
      .eq(1)
      .removeClass("showIcon");
    $("#loginContain #passwordInput").attr("type", "password");
  }

  // 重置手机号登录表单
  function resetLoginPhone() {
    $(".phoneLogin #phoneInput").val("");
    $(".phoneLogin .phoneVerificationCode input").val("");
  }

  // 重置注册表单
  function resetRegister() {
    $("#registerContainer #passwordInput").val("");
    $("#registerContainer #accountInput").val("");
    $("#registerContainer #switchIcon")
      .children("img")
      .eq(0)
      .addClass("showIcon");
    $("#registerContainer #switchIcon")
      .children("img")
      .eq(1)
      .removeClass("showIcon");
  }

  // 左侧图片初始化逻辑
  window.addEventListener("load", () => {
    $("#head1").addClass("head1_active");
    $("#head2").addClass("head2_active");
    $("#head3").addClass("head3_active");
  });

  // 账号密码、手机号登录切换逻辑
  $("#tab_text1").on("click", function (e) {
    if (!$(e.target).hasClass("tab_text_active")) {
      initPage();
      resetLoginPhone();
    }
    $(e.target).toggleClass("tab_text_active", true);
    $("#tab_text2").toggleClass("tab_text_active", false);
    $("#line").toggleClass("line_active", false);
    $("#scrollContent").toggleClass("showPhoneContent", false);
  });
  $("#tab_text2").on("click", function (e) {
    if (!$(e.target).hasClass("tab_text_active")) {
      resetLoginPassword();
    }
    $(e.target).toggleClass("tab_text_active", true);
    $("#tab_text1").toggleClass("tab_text_active", false);
    $("#line").toggleClass("line_active", true);
    $("#scrollContent").toggleClass("showPhoneContent", true);
  });

  // 密码隐藏、显示逻辑
  $("#loginContain #switchIcon")
    .children("img")
    .on("click", function () {
      $("#loginContain #switchIcon").children("img").toggleClass("showIcon");
      if ($("#loginContain #showPassword").hasClass("showIcon")) {
        $("#loginContain #passwordInput").attr("type", "password");
      } else {
        $("#loginContain #passwordInput").attr("type", "text");
      }
    });
  $("#registerContainer #switchIcon")
    .children("img")
    .on("click", function () {
      $("#registerContainer #switchIcon")
        .children("img")
        .toggleClass("showIcon");
      if ($("#registerContainer #showPassword").hasClass("showIcon")) {
        $("#registerContainer #passwordInput").attr("type", "password");
      } else {
        $("#registerContainer #passwordInput").attr("type", "text");
      }
    });

  // 登录注册切换逻辑
  $("#toRegister").on("click", function () {
    resetRegister();
    $(".midContent").toggleClass("flipperLogin");
    $(".front").toggleClass("hideFront");
    $(".back").toggleClass("showBack");
    setTimeout(() => {
      initPage();
    }, 500);
  });
  $("#toBackBtn").on("click", function () {
    resetLoginPassword();
    $(".midContent").toggleClass("flipperLogin");
    $(".front").toggleClass("hideFront");
    $(".back").toggleClass("showBack");
    setTimeout(() => {
      initPage();
    }, 500);
  });

  // 注册功能
  $("#registerContainer #toRegisterBtn").on("click", function () {
    const userName = $("#registerContainer #usernameInput").val();
    const account = $("#registerContainer #accountInput").val();
    const password = $("#registerContainer #passwordInput").val();
    const verificationCode = $(
      "#registerContainer .verificationCode input"
    ).val();

    if (!account || !password || !verificationCode)
      return Message("请输入账号密码与验证码！", 4000);
    // if (!isValidInput(username) || !isValidInput(password)) {
    //   Message("请输入长度为8-16的正确格式账号密码！", 4000);
    //   return;
    // }

    // const shaObj = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
    // shaObj.update(account);
    // const hashAccount = shaObj.getHash("HEX");

    const shaObj2 = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
    shaObj2.update(password);
    const hashPassword = shaObj2.getHash("HEX");

    request(
      "SSO/register",
      "POST",
      {},
      {
        userName,
        account: account,
        password: hashPassword,
        verificationCode,
      },
      function (res) {
        console.log("res", res);
        if (!res.successful) {
          $("#registerContainer .verificationCode input").val("");
          initPage();
        } else {
          if (res.data.url && res.data.ticket) {
            // console.log();

            window.location.href = `${res.data.url}?ticket=${res.data.ticket}`;
          }
        }
        // else {
        //   // 存储本地
        //   localStorage.setItem("SSO-TOKEN", res.data.token);
        // }
      },
      function () {
        initPage();
      }
    );
  });

  // 登录功能（账号密码）
  $("#loginContain .toLoginBtn").on("click", function () {
    // 账号密码
    if ($("#tab_text1").hasClass("tab_text_active")) {
      const account = $("#loginContain #accountInput").val();
      const password = $("#loginContain #passwordInput").val();
      const verificationCode = $("#loginContain .verificationCode input").val();

      if (!account || !password || !verificationCode)
        return Message("请输入账号密码与验证码！", 4000);

      const shaObj2 = new jsSHA("SHA-512", "TEXT", { encoding: "UTF8" });
      shaObj2.update(password);
      const hashPassword = shaObj2.getHash("HEX");

      request(
        "SSO/login",
        "POST",
        {},
        {
          account,
          password: hashPassword,
          verificationCode,
        },
        function (res) {
          if (!res.successful) {
            $("#loginContain .verificationCode input").val("");
            initPage();
          } else {
            if (res.data.url && res.data.ticket) {
              window.location.href = `${res.data.url}?ticket=${res.data.ticket}`;
            }
          }
        },
        function () {
          initPage();
        }
      );
    } else {
      // 手机号注册并登录
      const phone = $(".phoneLogin #phoneInput").val();
      const phoneVerificationCode = $(
        ".phoneLogin .phoneVerificationCode input"
      ).val();
      if (!phone || !phoneVerificationCode)
        return Message("请输入手机号与验证码！", 4000);
      const formatPhone = phone.replace(/\s/g, "");
      if (!isValidPhoneNumber(formatPhone))
        return Message("请输入正确的手机号！", 4000);

      const userName =
        "用户" + formatPhone.substring(Math.max(0, formatPhone.length - 4));
      console.log("userName", userName);

      request(
        "SSO/phone/login",
        "POST",
        {},
        {
          phone: phone.replace(/\s/g, ""),
          verificationCode: phoneVerificationCode,
        },
        function (res) {
          if (!res.successful) {
            $("#loginContain .verificationCode input").val("");
            // 更新token
            // initPage();
          } else {
            if (res.data.url && res.data.ticket) {
              window.location.href = `${res.data.url}?ticket=${res.data.ticket}`;
            }
          }
        }
      );
    }
  });

  // 手机号录入格式化功能
  $(".phoneLogin #phoneInput").on("input", function (e) {
    let inputVal = e.target.value.replace(/[^\d]/g, ""); // 移除所有非数字字符
    const arry = inputVal.split("");
    if (arry[3]) {
      arry.splice(3, 0, " ");
    }
    if (arry[8]) {
      arry.splice(8, 0, " ");
    }
    inputVal = arry.slice(0, 13).join("");
    setTimeout(() => {
      e.target.value = inputVal;
    }, 0);
  });

  // 手机号发送验证码功能
  $(".phoneLogin .phoneVerificationCode button").on("click", function () {
    const phone = $(".phoneLogin #phoneInput").val();
    if (!phone) return Message("请输入手机号！", 4000);
    if (!isValidPhoneNumber(phone.replace(/\s/g, "")))
      return Message("请输入正确的手机号！", 4000);
    if ($(".phoneLogin .phoneVerificationCode button").hasClass("countDown"))
      return;
    getPhoneToken(phone.replace(/\s/g, ""));
  });
} else {
  $("#pc_back").remove();
  // 更新rem单位
  getCurrentRem();

  // // 手机号录入格式化功能
  $("#mobile_back .phoneInput").on("input", function (e) {
    let inputVal = e.target.value.replace(/[^\d]/g, ""); // 移除所有非数字字符
    const arry = inputVal.split("");
    if (arry[3]) {
      arry.splice(3, 0, " ");
    }
    if (arry[8]) {
      arry.splice(8, 0, " ");
    }
    inputVal = arry.slice(0, 13).join("");
    setTimeout(() => {
      e.target.value = inputVal;
    }, 0);
  });

  // // 手机号发送验证码功能
  $("#mobile_back .verificationCode button").on("click", function () {
    const phone = $("#mobile_back .phoneInput").val();
    if (!phone) return Message("请输入手机号！", 4000);
    if (!isValidPhoneNumber(phone.replace(/\s/g, "")))
      return Message("请输入正确的手机号！", 4000);
    if ($("#mobile_back .verificationCode button").hasClass("countDown"))
      return;
    getPhoneToken(phone.replace(/\s/g, ""), true);
  });

  $("#mobile_back .loginBtn").on("click", function () {
    // 手机号注册并登录
    const phone = $("#mobile_back .phoneInput").val();
    const phoneVerificationCode = $(
      "#mobile_back .verificationCode input"
    ).val();
    if (!phone || !phoneVerificationCode)
      return Message("请输入手机号与验证码！", 4000);
    const formatPhone = phone.replace(/\s/g, "");
    if (!isValidPhoneNumber(formatPhone))
      return Message("请输入正确的手机号！", 4000);

    // const userName =
    //   "用户" + formatPhone.substring(Math.max(0, formatPhone.length - 4));
    // console.log("userName", userName);

    request(
      "SSO/phone/login",
      "POST",
      {},
      {
        phone: formatPhone,
        verificationCode: phoneVerificationCode,
      },
      function (res) {
        if (!res.successful) {
          $("#mobile_back .verificationCode input").val("");
          // 更新token
          // initPage();
        } else {
          if (res.data.url && res.data.ticket) {
            window.location.href = `${res.data.url}?ticket=${res.data.ticket}`;
          }
        }
      }
    );
  });

  setTimeout(() => {
    $(".mobile_back .midContent").addClass("showMidContent");
  }, 500);
}
