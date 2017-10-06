$(function(){
	//图片轮播
	var 
		banner    = $('#banner'),
		direction = $('#direction'),
		oLists    = $('#banner ul'),
		aLi       = oLists.find('li'),
		leftArrow = $("#left-arrow"),
		rightArrow= $("#right-arrow"),
		timer     = null;
		
		banner.on('mouseenter',function(){
			clearInterval(timer);
			direction.css('display','block');
		})
		banner.on('mouseleave',function(){
			timer = setInterval(function(){
				move();
			},3000);
			direction.css('display','none');
		})
		//克隆第一张，追加到ul的后面
		aLi.eq(0).clone(true).appendTo(oLists);
		//设置ul的宽度
		var preWidth = aLi.eq(0).width();//取得单个li的宽度
		oLists.width((aLi.length + 1) * preWidth);
		
		var  i = 0;

		
		timer = setInterval(function(){
			move();
		},3000);
		
		function move(){
			//向右滑动
			i++;
			if(i == aLi.length+1){
				i = 1;
				oLists.css("left",0);
			}
			//向左滑动
			
			if(i == -1){
				i = aLi.length - 1;
				oLists.css("left",-aLi.length * preWidth);
			}
			//计算left值
			oLists.stop().animate({"left": -i * preWidth},500);
//			console.log(-i * preWidth)
		}
	rightArrow.click(function(){
		move();
	})
	leftArrow.click(function(){
		move();
	})
	
	//根据鼠标进入方向出现遮罩层
	$(".psd ul li").hover(function(e) {
		var e = e || event;
		moveTo.call(this, e, true);
	}, function(e) {
		var e = e || event;
		moveTo.call(this, e, false);
	});
	
	function moveTo(e,bool) {
//		console.log(e.bool);
		let top = $(this).offset().top,
			bottom = top + $(this).height(),
			left = $(this).offset().left,
			right = left + $(this).width(),
			height = $(this).height(),
			width = $(this).width();
			
			x = e.pageX;
			y = e.pageY;
			
			sT = Math.abs(y - top);
			sB = Math.abs(y - bottom);
			sL = Math.abs(x - left);
			sR = Math.abs(x - right);
			a = Math.min(sT, sB, sL, sR);
			
			
			
		switch(a) {
			case sT:
				if(bool) {
					$(this).find("span").css({
						top: -height + "px",
						left: 0
					}).stop().animate({
						top: 0,
						left: 0
					}, 300)
				} else {
					$(this).find("span").stop().animate({
						top: -height + "px",
						left: 0
					}, 300)
				}
				//console.log("上")
				break;
			case sB:
				if(bool) {
					$(this).find("span").css({
						top: height + "px",
						left: 0
					}).stop().animate({
						top: 0,
						left: 0
					}, 300)
				} else {
					$(this).find("span").stop().animate({
						top: height + "px",
						left: 0
					}, 300)
				}

				//console.log("下")
				break;
			case sL:
				if(bool) {
					$(this).find("span").css({
						top: 0,
						left: -width + "px"
					}).stop().animate({
						top: 0,
						left: 0
					}, 300)
				} else {
					$(this).find("span").stop().animate({
						top: 0,
						left: -width + "px"
					}, 300)
				}

				//console.log("左")
				break;
			case sR:
				if(bool) {
					$(this).find("span").css({
						top: 0,
						left: width + "px"
					}).stop().animate({
						top: 0,
						left: 0
					}, 300)
				} else {
					$(this).find("span").stop().animate({
						top: 0,
						left: width + "px"
					}, 300)
				}
				//console.log("右")
				break;
		}
	}
	
	//分享展示
	$('.user_img ul li').click(function(){
		$(this).addClass('active').siblings().removeClass('active');
	})
})
