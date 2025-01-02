/*
 * @Description: file content
 * @Author: cg
 * @Date: 2024-10-18 09:47:47
 * @LastEditors: cg
 * @LastEditTime: 2025-01-02 11:27:37
 */
import fs from "fs/promises";
import path from "path";
import * as Terser from "terser";
import CleanCSS from "clean-css";
import { minify } from "html-minifier";
import { nanoid } from "nanoid";
import fsExtra from "fs-extra";

// 指定源目录和目标目录
const sourceDir = "src";
const targetDir = "login_sso";
const base = "login";

// 删除目标目录
await fsExtra.emptyDir(targetDir);

// 创建目标目录
await fs.mkdir(targetDir, { recursive: true });

let tempHtmlConfig = {};

let tempNameList = {};

// 递归复制目录
const copyFolderRecursiveAsync = async (source, destination) => {
  const items = await fs.readdir(source, { withFileTypes: true });
  for (const item of items) {
    const sourceItem = path.join(source, item.name);
    let destItem = path.join(destination, item.name);
    if (item.isDirectory()) {
      // 如果是目录，则递归复制
      await fs.mkdir(destItem, { recursive: true });
      await copyFolderRecursiveAsync(sourceItem, destItem);
    } else {
      const extname = path.extname(item.name);
      // 如果是JavaScript文件，则压缩并复制
      if (extname === ".js" && !source.includes("src\\plugin")) {
        const data = await fs.readFile(sourceItem, "utf8");
        try {
          const result = await Terser.minify(data);
          if (result.error) {
            console.error(
              `Error compressing file ${sourceItem}:`,
              result.error
            );
            continue;
          }
          const newName =
            path.basename(item.name, extname) + "_" + nanoid() + extname;
          destItem = path.join(destination, newName);
          await fs.writeFile(destItem, result.code, "utf8");
          tempNameList["js/" + item.name] = "js/" + newName;
          console.log(`Compressed and copied ${sourceItem} to ${destItem}`);
        } catch (err) {
          console.error(`Error compressing file ${sourceItem}:`, err);
        }
      } else if (extname === ".css") {
        const data = await fs.readFile(sourceItem, "utf8");
        // 压缩CSS文件
        const result = new CleanCSS().minify(data);
        if (result.errors.length > 0) {
          console.error(
            `Error compressing file ${inputFilePath}:`,
            result.errors
          );
          continue;
        }
        const newName =
          path.basename(item.name, extname) + "_" + nanoid() + extname;
        destItem = path.join(destination, newName);
        await fs.writeFile(destItem, result.styles, "utf8");
        tempNameList["style/" + item.name] = "style/" + newName;
        console.log(`Compressed and copied ${sourceItem} to ${destItem}`);
      } else if (extname === ".html") {
        const data = await fs.readFile(sourceItem, "utf8");
        let minifiedHtml = minify(data, {
          collapseWhitespace: true, // 去除空白字符
          removeComments: true, // 移除注释
          removeRedundantAttributes: true, // 移除冗余属性
          useShortDoctype: true, // 使用简短的 doctype
          minifyJS: true, // 压缩内联 JS
          minifyCSS: true, // 压缩内联 CSS
          minifyURLs: true, // 压缩 URL
        });
        // 存储相关信息
        tempHtmlConfig.destItem = destItem;
        tempHtmlConfig.minifiedHtml = minifiedHtml;
        tempHtmlConfig.sourceItem = sourceItem;
      } else if (extname === ".less") {
        continue;
      } else {
        // 如果是文件，则复制文件
        await fs.copyFile(sourceItem, destItem);
      }
    }
  }
};

copyFolderRecursiveAsync(sourceDir, targetDir).then(async () => {
  // 修改html中引用文件名称
  if (tempHtmlConfig.destItem && tempHtmlConfig.minifiedHtml) {
    for (let item in tempNameList) {
      const regex = new RegExp(item, "g");
      tempHtmlConfig.minifiedHtml = tempHtmlConfig.minifiedHtml.replace(
        regex,
        tempNameList[item]
      );
    }

    if (base) {
      // 修改base
      const regex = new RegExp(`<base href="/">`, "g");
      tempHtmlConfig.minifiedHtml = tempHtmlConfig.minifiedHtml.replace(
        regex,
        `<base href="/${base}/" >`
      );
    }

    console.log(
      `Compressed and copied ${tempHtmlConfig.sourceItem} to ${tempHtmlConfig.destItem}`
    );

    await fs.writeFile(
      tempHtmlConfig.destItem,
      tempHtmlConfig.minifiedHtml,
      "utf8"
    );
  }

  // 复制docker，niginx配置
  await fs.copyFile("nginx.conf", `${targetDir}/nginx.conf`);
  await fs.copyFile("Dockerfile", `${targetDir}/Dockerfile`);
});
