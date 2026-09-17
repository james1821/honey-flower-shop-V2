import imageCompression from 'browser-image-compression'

export interface UploadedImage { url: string; path: string }

// Compresses images then uploads to Cloudinary (unsigned preset, no backend needed)
export function useImageUpload() {
  const config = useRuntimeConfig()
  const uploading = ref(false)
  const progressLabel = ref('')

  async function compressImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') return file
    try {
      return await imageCompression(file, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        initialQuality: 0.82,
        fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
      })
    } catch (e) {
      console.error('Image compression failed, uploading original file instead', e)
      return file
    }
  }

  async function uploadImage(file: File, folder: string): Promise<UploadedImage> {
    const cloudName = config.public.cloudinaryCloudName
    const uploadPreset = config.public.cloudinaryUploadPreset
    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary is not configured — set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in .env (see MIGRATION.md).')
    }

    uploading.value = true
    progressLabel.value = 'Compressing…'
    try {
      const compressed = await compressImage(file)
      progressLabel.value = 'Uploading…'

      const body = new FormData()
      body.append('file', compressed)
      body.append('upload_preset', uploadPreset)
      body.append('folder', folder)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body })
      if (!res.ok) {
        const errBody = await res.json().catch(() => null)
        throw new Error(errBody?.error?.message ?? `Upload failed (${res.status})`)
      }
      const data = await res.json()
      return { url: data.secure_url as string, path: data.public_id as string }
    } finally {
      uploading.value = false
      progressLabel.value = ''
    }
  }

  async function uploadImages(files: File[], folder: string): Promise<UploadedImage[]> {
    const out: UploadedImage[] = []
    for (const file of files) out.push(await uploadImage(file, folder))
    return out
  }

  // deleting requires a signed request, so we just drop the reference and leave the file
  async function deleteImageByUrl(_url: string) {}

  return { uploading, progressLabel, uploadImage, uploadImages, deleteImageByUrl, compressImage }
}
