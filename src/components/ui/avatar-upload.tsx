/**
 * 头像上传组件
 * 支持图片选择、预览、客户端压缩和上传
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/** 头像上传组件 Props */
interface AvatarUploadProps {
  /** 当前头像 URL */
  currentAvatar?: string;
  /** 用于默认头像显示的用户名 */
  username?: string;
  /** 上传成功回调，返回新头像 URL */
  onSuccess: (url: string) => void;
  /** 认证 token */
  token: string;
  /** 头像尺寸（px），默认 96 */
  size?: number;
}

/**
 * 将图片文件压缩为 JPEG（最大 400x400，质量 0.8）
 * @param file - 原始图片文件
 * @returns 压缩后的 Blob
 */
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        // 等比缩放到 maxSize
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建 Canvas 上下文'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('图片压缩失败'));
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 头像上传组件
 * 圆形头像展示，支持点击上传、预览、压缩
 */
export default function AvatarUpload({
  currentAvatar,
  username,
  onSuccess,
  token,
  size = 96,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 清理 ObjectURL 防止内存泄漏
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /** 触发文件选择 */
  const handleClick = useCallback(() => {
    if (!uploading) {
      inputRef.current?.click();
    }
  }, [uploading]);

  /** 处理文件选择 */
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // 验证文件类型（仅允许常见位图格式，排除 SVG 等）
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('仅支持 JPG/PNG/GIF/WebP 格式');
        return;
      }

      // 验证文件大小（最大 10MB）
      if (file.size > 10 * 1024 * 1024) {
        setError('图片大小不能超过 10MB');
        return;
      }

      setError(null);

      // 生成预览
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // 开始上传流程
      setUploading(true);
      try {
        // 客户端压缩
        const compressedBlob = await compressImage(file);

        // 构建 FormData
        const formData = new FormData();
        formData.append('file', compressedBlob, 'avatar.jpg');
        formData.append('type', 'avatar');

        // 上传到服务器
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.code === 200 && result.data?.url) {
          onSuccess(result.data.url);
        } else {
          throw new Error(result.message || '上传失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '上传失败，请重试');
        // 上传失败时清除预览
        setPreview(null);
      } finally {
        setUploading(false);
        // 重置 input，允许重复选择同一文件
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }

    },
    [token, onSuccess]
  );

  // 当前显示的头像：预览 > 当前头像
  const displayAvatar = preview || currentAvatar;
  // 默认头像首字母
  const initial = username?.[0] || '👤';

  // 相机按钮尺寸随头像尺寸缩放
  const cameraSize = Math.max(24, Math.round(size * 0.33));

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* 隐藏的文件输入 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 头像主体 - 可点击 */}
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="w-full h-full rounded-full overflow-hidden shadow-2xl border-4 border-white focus:outline-none focus:ring-4 focus:ring-purple-300 transition-transform hover:scale-105 active:scale-95"
        aria-label="点击上传头像"
      >
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt="头像"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <span
              className="text-white font-black"
              style={{ fontSize: size * 0.4 }}
            >
              {initial}
            </span>
          </div>
        )}

        {/* 上传中遮罩 */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <div
              className="border-3 border-white border-t-transparent rounded-full animate-spin"
              style={{
                width: size * 0.35,
                height: size * 0.35,
                borderWidth: 3,
              }}
            />
          </div>
        )}
      </button>

      {/* 右下角相机图标 */}
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="absolute bottom-0 right-0 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform focus:outline-none"
        style={{ width: cameraSize, height: cameraSize }}
        aria-label="更换头像"
      >
        <span style={{ fontSize: cameraSize * 0.6 }}>📷</span>
      </button>

      {/* 错误提示 */}
      {error && (
        <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-red-500 font-bold bg-white/90 px-2 py-0.5 rounded-full shadow">
          {error}
        </p>
      )}
    </div>
  );
}
