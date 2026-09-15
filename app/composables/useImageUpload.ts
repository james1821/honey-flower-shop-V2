import imageCompression from 'browser-image-compression'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

export interface UploadedImage { url: string; path: string }

/**
 * Client-side image upload to Firebase Storage. Every image is compressed/resized in the
 * browser (via `browser-image-compression`, which uses a Web Worker + canvas) before it's
 * uploaded, so admins can drop in large phone photos without bloating Storage usage or
 * slowing down the storefront.
 */
export function useImageUpload() {
  const storage = useFirebaseStorage()
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
    uploading.value = true
    progressLabel.value = 'Compressing…'
    try {
      const compressed = await compressImage(file)
      progressLabel.value = 'Uploading…'
      const ext = compressed.type === 'image/png' ? 'png' : compressed.type === 'image/webp' ? 'webp' : 'jpg'
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const fileRef = storageRef(storage, path)
      await uploadBytes(fileRef, compressed, { contentType: compressed.type })
      const url = await getDownloadURL(fileRef)
      return { url, path }
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

  async function deleteImageByUrl(url: string) {
    try {
      const fileRef = storageRef(storage, url)
      await deleteObject(fileRef)
    } catch (e) {
      // Non-fatal: could be an old external URL (e.g. pre-migration Supabase links) that
      // isn't actually in Firebase Storage, or already deleted.
      console.warn('Could not delete storage file for', url, e)
    }
  }

  return { uploading, progressLabel, uploadImage, uploadImages, deleteImageByUrl, compressImage }
}
