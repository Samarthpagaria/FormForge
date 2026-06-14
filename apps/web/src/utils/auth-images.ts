export const SIGN_IN_IMAGES = [
  "/authSiginIn/beat.jpg",
  "/authSiginIn/but_first_cofee.jpg",
  "/authSiginIn/cat.png",
  "/authSiginIn/ur_cool.jpg",
  "/authSiginIn/what_if_it_all_works_out.jpg",
];

export const SIGN_UP_IMAGES = [
  "/authSignUp/its_done.jpg",
  "/authSignUp/keep_going_dont_panic.jpg",
  "/authSignUp/no_fearjpg.jpg",
  "/authSignUp/no_risk_no_story.png",
  "/authSignUp/reach_the_imposible.jpg",
];

/**
 * Utility to pick a random image from a given list
 */
export function getRandomImage(images: string[]): string {
  if (images.length === 0) return "";
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex] || "";
}

/**
 * Selects a random auth image based on the current pathname
 */
export function getRandomAuthImage(pathname: string): string {
  if (pathname.includes("/sign-up")) {
    return getRandomImage(SIGN_UP_IMAGES);
  }
  // Default to Sign In images for other auth routes
  return getRandomImage(SIGN_IN_IMAGES);
}
