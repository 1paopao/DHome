$(function(){
	//图片轮播
	$.ajax({
		type:"get",
		url:"http://www.drehome.com/dreamhome/banner",
		success:function(data){
			var arr = data.data;
//			console.log(arr);
			var html = "";
			arr.map(function(res){
				html += `<li><img src="${res.banner_pic}" /></li>`;
			})
			$('#banner ul').html(html);
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
		}
	});
	
	
	//根据鼠标进入方向出现遮罩层
	$.ajax({
		type:"get",
		url:"http://www.drehome.com/dreamhome/casemain",
		success:function(data){
			var arr = data.data;
//			console.log(arr);
			var html = "";
			arr.map(function(res){
				html += `<li>
							<img src="${res.case_pic}" />
							<span class="hovers">${res.case_style}</span>
						</li>`;
			})
			$('.psd ul').html(html);
			//跳转详情页
			$('.psd ul').on('click','li',function(){
				
			})
			$(".psd ul li").hover(function(e) {
				var e = e || event;
				moveTo.call(this, e, true);
			}, function(e) {
				var e = e || event;
				moveTo.call(this, e, false);
			});
	
	function moveTo(e,bool) {
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
		}
	});
	
	//首页公司展示
	$.ajax({
		type:"get",
		url:"http://www.drehome.com/dreamhome/companymain",
		success:function(data){
			var arr = data.data;
//			console.log(arr);
			var 
				html = "",
				id = [];
			arr.map(function(res){
				html += `<li>
							<img src="${res.company_pic}" />
							<div>
								<p>${res.company_name}</p>
							</div>
						</li>`;
				id.push(res.company_id);
			})
			$('.fitup ul').html(html);
//			console.log(id)
			$('.fitup ul').on('click','li',function(){
				var i = $(this).index();
//				localStorage.setItem()
				location.href = '../view/compdetail.html?id='+id[i];
			})
		}
	});
	
	//首页分享展示
	$.ajax({
		type:"get",
		url:"http://www.drehome.com/dreamhome/talkmain",
		success:function(data){
			var arr = data.data;
//			console.log(arr);
			var 
				html = "",
				imgs = "";
			arr.map(function(res,i){
//				console.log(res)
				html += `<dl>
							<dt><img src="${res.user.user_icon}"/></dt>
							<dd>
								<h2>${res.talk_title}</h2>
								<p>
									<span class="type">${res.case.case_style}</span>
									<span class="company">${res.company.company_name}</span>
								</p>
								<p>${res.talk_content}</p>
							</dd>
						</dl>`;
				imgs += `<li>
							<img src="${res.user.user_icon}" />
						</li>`;
			})
			$('.share_info div').html(html);
			$('.user_img ul').html(imgs);
				//分享展示
			$('.user_img ul li').eq(0).addClass('active');
			
			$('.user_img ul').on('click','li',function(){
				var i = $(this).index();
				$(this).addClass('active').siblings().removeClass('active');
			    $('.share_info div dl').eq(i).fadeIn(400).siblings().fadeOut(400);
			})
		}
	});
})
