

var gulp       = require('gulp'), // Подключаем Gulp
    sass         = require('gulp-sass'), //Подключаем Sass пакет,
    browserSync  = require('browser-sync').create(), // Подключаем Browser Sync
    concat       = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify         = require('gulp-uglify'),
    cleanCSS       = require('gulp-clean-css'),
    rename       = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del          = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin     = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    cache        = require('gulp-cache'), // Подключаем библиотеку кеширования
    gcmq           = require('gulp-group-css-media-queries'),
    notify         = require("gulp-notify"),
    spritesmith = require("gulp.spritesmith"),
    rsync          = require('gulp-rsync'),
    cssnano      = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    plumber = require('gulp-plumber'), // Чтоб при ошибке не падал сервер
    autoprefixer = require('gulp-autoprefixer');// Подключаем библиотеку для автоматического добавления префиксов
	var buffer = require('vinyl-buffer');
	var csso = require('gulp-csso');
	var imagemin = require('gulp-imagemin');
	var merge = require('merge-stream');
	var del = require('del');
	var clean = require('gulp-clean');
    var smartGrid = require('smart-grid');
    var gridOptPath = './app/smart_grid_conf.js';
    var path = require('path');

	function style(){
		return gulp.src('app/sass/**/*.scss')
		.pipe(sass())
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) // Создаем префиксы
		.pipe(gcmq())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.stream());
	}

	function js(){
		return gulp.src('app/js/*.js')
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'))
		.pipe(browserSync.stream());
	}

	function watch(){
		browserSync.init({
			server: {
				baseDir: 'app'
			}
		});

		gulp.watch('app/sass/**/*.scss', style);
		// gulp.watch('app/js/*.js', js);
		gulp.watch('app/*.html').on('change', browserSync.reload);
		gulp.watch('app/js/*.js').on('change', browserSync.reload);
	}

	// Сборка спрайтов PNG
  gulp.task('spritemade', function () {
  // Generate our spritesheet
  var spriteData = gulp.src('app/img/sprite/*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: '_sprite.scss'
  }));

  // Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest('app/img/'));

  // Pipe CSS stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
    .pipe(csso())
    .pipe(gulp.dest('app/sass/base/'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});



function grid(done){
    delete require.cache[path.resolve(gridOptPath)];
    let options = require(gridOptPath);
    smartGrid('app/sass', options);
    done();
 }

gulp.task(grid, 'grid');

exports.style = style;
exports.watch = watch;
exports.js = js;





/*gulp.task("smart-grid", (cb) => {
    smartgrid(('sass/mixins/_smartgrid'), {
        outputStyle: "scss",
        filename: "_smart-grid",
        columns: 12, // number of grid columns
        offset: "30px", // gutter width
        mobileFirst: false,
        mixinNames: {
            container: "container"
        },
        container: {
            fields: "15px" // side fields
        },
        breakPoints: {
            xs: {
                width: "320px"
            },
            sm: {
                width: "576px"
            },
            md: {
                width: "768px"
            },
            lg: {
                width: "992px"
            },
            xl: {
                width: "1200px"
            }
        }
    });
    cb();
});
*/

var settings = {
    outputStyle: 'scss', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: '30px', /* gutter width px || % || rem */
    mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1200px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            width: '1100px', /* -> @media (max-width: 1100px) */
        },
        md: {
            width: '960px'
        },
        sm: {
            width: '780px',
            fields: '15px' /* set fields only if you want to change container.fields */
        },
        xs: {
            width: '560px'
        }
        /*
        We can create any quantity of break points.

        some_name: {
            width: 'Npx',
            fields: 'N(px|%|rem)',
            offset: 'N(px|%|rem)'
        }
        */
    }
};
