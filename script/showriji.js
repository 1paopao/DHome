
export default {
	//显示用户的日记信息
	init:function() {
		//判断用户是否存在
		if(sessionStorage.getItem('username')) {
			//获取相对应用户的数据
			var 
				sname = sessionStorage.getItem('username'),
				surl  = 'http://www.drehome.com/dreamhome/talkmain';
			
			//获取接口数据
			$.get(surl,function(data) {
				var 
					oData = data.data;
				
				//遍历数组
				oData.map(function(el,i) {
					//转换为时间？？？？
					var 
						time  = new Date(el.talk_time).toLocaleString();
						
					console.log(el);
					$('.con').append(`<dl>
									<dt><img src="${el.user.user_icon}"/></dt>
									<dd>
										<p>
											<span>${el.talk_title}</span>
											<span><em>${el.talk_collection}</em><em>${el.talk_level}</em></span>
										</p>
										<p>
											<em>${el.company.city}</em>
											<em>${el.company_design}m²</em>
											<em>${el.company_style}</em>
										</p>
										<p>${el.talk_content}...<em class="look-detail" data-id="${el.talk_id}">查看详情>></em></p>
										<p>${time}</p>
									</dd>
								</dl>
							`);
						
				})
			})
			
		}
	},
	//写日记
	write:function() {
		$('.writerj').click(function() {
			//判断是否登录
			if(sessionStorage.getItem('username')) {
				//跳转页面
				location.href = 'fatie.html';
			} else {
				alert('亲,请先登录哦~');
			}
		})
	},
	//查看详情
	showDairy:function () {
		var sId = '';
		//跳转页面
		$('.con').on('click','.look-detail',function(){
			//获取id
			 
			sId = $(this).attr('data-id');

			location.href = 'rijidetail.html?'+sId;
		})
	 		//截取sid
			var str = window.location.search.substring(1,2);

			//获取数据
			var
			 	surl  = 'http://www.drehome.com/dreamhome/talkmain';
			
			$.get(surl,function(data){
				var 
					oData = data.data;
					
				//遍历数组
				for(var j = 0,len = oData.length; j < len; j++) {
					//判断id是否相等
					if(str == oData[j].talk_id) {
						$('.diary-detail').html(`
											<p>装修日记 >
												<span id="">
													${oData[j].talk_title}
											    </span>
										    </p>
										    
										    
										    <dl>
										    	<dt>
										    		<span>
										    			<img src="${oData[j].user.user_icon}" alt="" />
										    		</span>
										    		<br />
										    		<strong>GIN.</strong>
										    	</dt>
										    	<dd>
										    		<div class="dd-left">
											    		<h2>${oData[j].talk_content}</h2>
											    		<p id="">
											    			2017-09-29 16:21
											    		</p>
											    		<p>
											    			房屋信息：    
											    			<span>72</span>㎡&nbsp;
											    			<span>简约</span>
											    			<span>半包</span>
											    		</p>
											    		<p>
											    			  所在小区：    
											    			<span>长沙市</span>
											    			<span>鑫源小区</span>
											    		</p>
											    		<p>
											    			 装修公司：     
											    			<span>还在选择中</span>
											    		</p>
										    		</div>
								
													<div class="dd-right">
										    			<div>
										    				<em>39780</em>
										    				<span>浏览</span>
										    			</div>
										    			<div>
										    				<em>84</em>
										    				<span>收藏</span>
										    			</div>
										    			<div>
										    				<em>0</em>
										    				<span>回复</span>
										    			</div>
										    		</div>
										    	</dd>
										    </dl>`);
						
						$('.diat-text').html(`
								<span>2017年09月20日</span>
								<p>
									${oData[j].talk_content}
								</p>
								<span>
									<span><em>1条回复 </em>&nbsp;<em>2</em></span>
								</span>
								<i class="jt"></i>`);
					}
				}
			})
			
			
	}
	
}
