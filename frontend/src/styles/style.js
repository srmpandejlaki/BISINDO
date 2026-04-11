// import semua file .scss dari subfolder styles

const style = import.meta.glob([
  './**/*.scss',
], { eager: true });