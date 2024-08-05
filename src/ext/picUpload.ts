// codemirror 上传图片插件
// 默认使用fetch上传, 可以自己写上传逻辑
import { EditorView } from "codemirror";
import { Extension } from '@codemirror/state'

import {
  getLoadingText,
  isUrl
} from '../utils'

type picUploadOptions = {
  storageServer?: string;
  upload?: (file: File) => Promise<string>;
  callback?: (res: any) => string;
}

type officialOptions = {
  storageServer: string;
  callback: (res: any) => string;
}

type customOptions = {
  upload: (file: File) => Promise<string>;
}

const getStragedUrl = async (file: File, options: picUploadOptions) => {
  if (options.upload) {
    let result = await options.upload(file);
    return result || "上传失败";
  } else if (typeof options.storageServer === 'string' && options.callback instanceof Function) {
    // 修改file名称, 为时间
    const date = new Date();
    const time = date.getTime();
    const name = `${time}.${file.name.split(".").pop()}`;
    file = new File([file], name, { type: file.type });

    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/v1/document/page/imagePut", {
      method: "POST",
      body: formData,
    }).then(res => res.json());

    let result = options.callback(res);

    if (typeof result !== 'string' || result === '') {
      console.error('callback function should return a not empty string')
    }

    return result || "上传失败";
  }

  return console.error('upload function or storageServer is required')
}

let cursorPos: null | number = null;

function PicUploadExt(options: officialOptions): Extension;
function PicUploadExt(options: customOptions): Extension;
function PicUploadExt(options: picUploadOptions) {
  return EditorView.domEventHandlers({
    paste(event, view) {
      // 查看剪贴板的内容
      const clipboardData = (event as ClipboardEvent).clipboardData

      if (!clipboardData) {
        return console.error('clipboardData is empty')
      }


      for (let i = 0; i < clipboardData.items.length; i++) {
        const item = clipboardData.items[i];
        // 如果是图片, 先用一个字符串loading占位记住位置, 等图片上传成功后再替换
        if (item.kind === "file" && item.type.includes("image")) {
          const file = item.getAsFile()!!;
          const loadingText = getLoadingText(file);

          const { from, to } = view.state.selection.ranges[0];

          view.dispatch({
            changes: {
              from,
              to,
              insert: loadingText,
            },
          });
          const needToReplace = to + loadingText.length;

          getStragedUrl(file, options).then((url) => {
            if (!url || !isUrl(url)) {
              return console.error(`url is not valid: ${url}`)
            }
            const imgMd = `![${file.name}](${url})`;
            view.dispatch({
              changes: {
                from,
                to: needToReplace,
                insert: imgMd,
              },
              selection: {
                anchor: from + imgMd.length,
                head: from + imgMd.length,
              },
            });
          })
        }
      }

    },
    drop(event, view) {
      // 阻止浏览器默认行为
      event.preventDefault();
      // 获取拖拽的文件
      const file = event.dataTransfer?.files?.[0];

      if (!file) {
        return console.error('file is required')
      }
      // 占位符位置
      let pos = cursorPos;
      let loadingText = getLoadingText(file);

      if (!pos) {
        pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      }

      if (!pos) return

      view.dispatch({
        changes: {
          from: pos,
          to: pos,
          insert: loadingText,
        },
      });

      getStragedUrl(file, options).then((url) => {
        if (!url || !isUrl(url)) {
          return console.error(`url is not valid: ${url}`)
        }
        const imgMd = `![${file.name}](${url})`;
        // 替换结果
        view.dispatch({
          changes: {
            from: pos,
            to: pos + loadingText.length,
            insert: imgMd,
          },
          selection: {
            anchor: pos + imgMd.length,
            head: pos + imgMd.length,
          },
        });
      })
    },
    dragover(event, view) {
      const { clientX, clientY } = event;
      // 根据鼠标坐标获取文档中的位置
      const pos = view.posAtCoords({ x: clientX, y: clientY });
      cursorPos = pos
    }
  })
}

export default PicUploadExt

