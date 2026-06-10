// import semua file .scss dari subfolder styles

const _style = import.meta.glob([
  './**/*.scss',
  '../../features/**/*.scss',
], { eager: true });