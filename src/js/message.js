/*
 * @Description: 登录框
 * @Author: 朱晨光
 * @Date: 2024-06-16 12:24:20
 * @LastEditors: cg
 * @LastEditTime: 2024-09-02 11:20:40
 */
const handleLine = [];

const Message = (text, timeout) => {
  const timeId = new Date().getTime();

  handleLine.unshift(timeId);

  $(".messageContainer").append(
    `<div id=${timeId} style="width: ${text.length * 20}px">${text}</div>`
  );

  setTimeout(() => {
    $(`#${timeId}`).css({
      opacity: 0,
    });
    $(`#${timeId}`).on("transitionend", () => $(`#${timeId}`).remove());
    handleLine.pop();
  }, timeout);

  setTimeout(() => {
    handleLine.forEach((item, index) => {
      $(`#${item}`).css({
        transform: `translateX(-50%) translateY(${(index + 1) * 65}px)`,
      });
    });
  }, 100);
};

const pushMessage = () => {};
