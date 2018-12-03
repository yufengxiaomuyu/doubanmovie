var utils = {
	//准备提示节点
	preparePrompt: function() {
		var tpl =
			   `<div class="iconfont icon-loading"></div> 
				<div class="bottom">
			 		<a class="returnTop" href="#">回到顶部</a>
				</div> `
		this.$container.append($(tpl));
	},
	//创建并设置电影节点
	createElementItem: function(movie){
		var tpl = 
				`<li class="item">
					<a href="">
						<div class="cover">
							<img src="">
						</div>
						<div class="introduction">
							<h3 class="title"></h3>
							<p><span class="score"> </span> 分 / <span class="collect"></span> 收藏</p>
							<p><span class="year"></span> / <span class="geners"></span></p>
							<p>导演：<span class="directors"></span></p>
							<p>主演：<span class="casts"></span></p>
						</div>
					</a>
				</li>`
		var $node = $(tpl);
		$node.find('a').attr('href',movie.alt);
		$node.find('.cover img').attr('src',movie.images.small);
		$node.find('.introduction .title').text(movie.title);
		$node.find('.introduction .score').text(movie.rating.average);
		$node.find('.introduction .collect').text(movie.collect_count);
		$node.find('.introduction .year').text(movie.year);
		$node.find('.introduction .geners').text(movie.genres.join('、'));
		$node.find('.introduction .directors').text(movie.directors.map(v => v.name).join('、'));
		$node.find('.introduction .casts').text(movie.casts.map(v => v.name).join('、'));
		return $node;
	},
	//设置数据
	setData: function(data){
		data.subjects.forEach((movie) => {
			movie = movie.subject ? movie.subject : movie; 
			this.$ul.append(utils.createElementItem(movie));
		});
	},
	//展示底部
	showBottom: function($panel){
		$panel.find('.bottom').css('display','block');
	},
	//回到顶部
	returnTop: function($panel) {
		$panel.find('.returnTop').click(function(){
			$panel.scrollTop(0);
		});
	},
} 

var top250 = {
	init: function() {
		this.$top250 = $('main #top250');
		this.$container = this.$top250.find('.container');
		this.$ul = this.$top250.find('ul');
		this.index = 0,this.count = 20,this.isLoading = false,this.isOver = false,this.clock;
		this.prepare();
		this.bind();
		this.start(); 
	},
	bind: function(){
		var _this = this;
		this.$top250.scroll(function(){
			if (_this.clock) clearTimeout(_this.clock);
			_this.clock = setTimeout(function(){
				if (_this.$container.height() - 400 <= _this.$top250.height() + _this.$top250.scrollTop()) {
					_this.renderData();
				}
			},100)
		});
		utils.returnTop(_this.$top250);
	},
	start: function(){
		this.renderData();
	},
	prepare: utils.preparePrompt,	
	//获取数据
	getData: function(){
		var _this = this;
		this.$iconLoading = this.$top250.find('.icon-loading');
		this.isLoading = true;
		this.$iconLoading.css('display','block');
		//发送请求
		$.ajax({
			url: 'https://api.douban.com/v2/movie/top250',
			data: {
				start: _this.index,
				count: _this.count,
			},
			dataType: 'jsonp',
		}).done((ret) => {
			this.index += this.count;
			if (this.index > ret.total ) this.isOver = true;
			this.setData(ret);
		}).fail(function(){
			alert('获取数据失败');
		}).always(() => {
			this.isLoading = false;
			this.$iconLoading.css('display','none');
		});
	},
	setData: utils.setData,
	renderData: function(){		
		if (this.isLoading) return;
		if (this.isOver) {
			utils.showBottom(this.$top250);
			return;
		}
		this.getData(); 
	},
}

var northAmerica = {
	init: function() {
		this.$northAmerica = $('main #northAmerica');
		this.$container = this.$northAmerica.find('.container');
		this.$ul = this.$northAmerica.find('ul');
		this.prepare();
		this.bind();
		this.start(); 
	},
	bind: function(){
		var _this = this;
		utils.returnTop(_this.$northAmerica);
	},
	start: function(){
		this.renderData();
	},
	prepare: utils.preparePrompt,	
	getData: function(callback){
		var _this = this;
		$.ajax({
			url: 'https://api.douban.com/v2/movie/us_box',
			dataType: 'jsonp',
		}).done((ret) => {
			this.setData(ret);
			callback(this.$northAmerica);
		}).fail(function(){
			alert('获取数据失败');
		})
	},
	setData: utils.setData,
	renderData: function(){
		this.getData(utils.showBottom);	
	}
}

var search = {
	init: function() {
		this.keyword;
		this.isLoading = false; 
		this.$search = $('main #search');
		this.$input = this.$search.find('input');
		this.$button = this.$search.find('.button'); 
		this.$container = this.$search.find('.container');
		this.$ul = this.$search.find('ul');
		this.prepare();
		this.bind(); 
	},
	bind: function(){
		var _this = this;
		this.$button.click(function(){
			if (_this.$ul.children()[0]) {
				_this.$ul.empty();
				_this.$container.find('.bottom').css('display','none');
			};
			_this.keyword = _this.$input.val();
			_this.renderData();
		});
		this.$input.keyup(function(e){
			if(e.keyCode === 13) {
				_this.$button.click();
			};
		});
		utils.returnTop(_this.$search);
	},
	prepare: utils.preparePrompt,	
	getData: function(callback){
		if (this.isLoading) return;
		var _this = this;
		this.$iconLoading = this.$search.find('.icon-loading');
		this.$iconLoading.css('display','block');
		this.isLoading = true;
			$.ajax({
			url: 'https://api.douban.com/v2/movie/search',
			data: {
				q: _this.keyword
			},
			dataType: 'jsonp',
		}).done((ret) => {
			this.setData(ret);
			callback(this.$search);
		}).fail(function(){
			alert('获取数据失败');
		}).always(() => {
			this.isLoading = false;
			this.$iconLoading.css('display','none');
		})	
	},
	setData: utils.setData,
	renderData: function(){
		this.getData(utils.showBottom);	
	},
}

var panels = {
	init: function(){
		this.$panels = $('main section');
		this.$tabs = $('footer li');
		this.bind();
	},
	//处理tab切换
	bind: function(){
		let _this = this;
		this.$tabs.click(function() {
			$(this).addClass('active').siblings().removeClass('active');
			_this.$panels.eq($(this).index()).show().siblings().hide();
		}); 
	},
}

var app = {
	init: function(){
		panels.init();
		top250.init();
		northAmerica.init();
		search.init();
	},
};

app.init();