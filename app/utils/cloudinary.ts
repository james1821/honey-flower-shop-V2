// Builds a Cloudinary delivery URL that fits the whole image into w×h without cropping,
// padding any empty space with a solid background. Falls back to the original URL for
// non-Cloudinary images (e.g. leftover Supabase links from before the migration).
export function cldPad(url: string | undefined | null, width: number, height: number, background = 'white'): string {
  if (!url) return ''
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url

  const transform = `c_pad,b_${background},w_${width},h_${height},q_auto,f_auto`
  return url.replace('/upload/', `/upload/${transform}/`)
}
