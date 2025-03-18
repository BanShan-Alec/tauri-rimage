use rimage::{Encoder, Format, Image, JpegEncoder, PngEncoder, WebPEncoder};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct CompressionOptions {
    pub format: String,
    pub quality: u8,
    pub alpha_quality: Option<u8>, // 用于WebP格式
    pub filter: Option<u8>,        // 用于PNG格式
    pub compression: Option<u8>,   // 用于PNG格式
}

#[tauri::command]
pub async fn compress_image(
    src_path: String,
    dest_path: String,
    options: CompressionOptions,
) -> Result<String, String> {
    let img = Image::open(&src_path)
        .map_err(|e| format!("无法打开图片: {}", e))?;

    let output_format = match options.format.as_str() {
        "jpg" | "jpeg" => Format::Jpeg,
        "png" => Format::Png,
        "webp" => Format::WebP,
        _ => return Err("不支持的图片格式".into()),
    };

    // 根据选择的格式使用对应的编码器
    match output_format {
        Format::Jpeg => {
            let encoder = JpegEncoder::new().with_quality(options.quality);
            let dest_path_obj = Path::new(&dest_path);
            img.save_with_encoder(dest_path_obj, &encoder)
                .map_err(|e| format!("保存JPEG图片失败: {}", e))?;
        }
        Format::Png => {
            let mut encoder = PngEncoder::new();
            if let Some(filter) = options.filter {
                encoder = encoder.with_filter(filter);
            }
            if let Some(compression) = options.compression {
                encoder = encoder.with_compression(compression);
            }
            let dest_path_obj = Path::new(&dest_path);
            img.save_with_encoder(dest_path_obj, &encoder)
                .map_err(|e| format!("保存PNG图片失败: {}", e))?;
        }
        Format::WebP => {
            let mut encoder = WebPEncoder::new().with_quality(options.quality);
            if let Some(alpha_quality) = options.alpha_quality {
                encoder = encoder.with_alpha_quality(alpha_quality);
            }
            let dest_path_obj = Path::new(&dest_path);
            img.save_with_encoder(dest_path_obj, &encoder)
                .map_err(|e| format!("保存WebP图片失败: {}", e))?;
        }
        _ => return Err("不支持的输出格式".into()),
    }

    Ok("图片压缩成功".into())
}

#[tauri::command]
pub async fn batch_compress_images(
    src_paths: Vec<String>,
    dest_dir: String,
    options: CompressionOptions,
) -> Result<Vec<String>, String> {
    let mut results = Vec::new();

    for src_path in src_paths {
        let filename = Path::new(&src_path)
            .file_name()
            .ok_or("无法获取文件名")?
            .to_str()
            .ok_or("文件名不是有效的UTF-8")?;
        
        let extension = match options.format.as_str() {
            "jpg" | "jpeg" => "jpg",
            "png" => "png",
            "webp" => "webp",
            _ => return Err("不支持的图片格式".into()),
        };
        
        // 生成不带原始扩展名的文件名
        let stem = Path::new(filename)
            .file_stem()
            .ok_or("无法获取文件名主体部分")?
            .to_str()
            .ok_or("文件名主体不是有效的UTF-8")?;
        
        // 构建目标文件路径
        let dest_path = format!("{}/{}.{}", dest_dir, stem, extension);
        
        match compress_image(src_path.clone(), dest_path.clone(), options.clone()).await {
            Ok(_) => results.push(format!("成功: {}", dest_path)),
            Err(e) => results.push(format!("失败: {} - {}", src_path, e)),
        }
    }

    Ok(results)
}
