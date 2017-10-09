export default {
	init:function() {
		$.ajax({
			type:"get",
			url:"http://www.drehome.com/dreamhome/companymain",
			success:function(data) {
				//遍历数组
				var aData = data.data;
				var html  = '';
				aData.map(function(el,i){
					html  = `<a href="compdetail.html?${el.company_id}" data-id="${el.company_id}">
								<dl>
									<dt>
										<img src="${el.company_pic}" alt="" />
									</dt>
									<dd>
										<div class="company-left">
											<p>${el.company_name}</p>
											<p>
												<span>营</span>
												<span>认</span>
												<span>惠</span>
												<span>金</span>
												<strong>20000元</strong>
												<span>设</span>
												<strong>271套</strong>
												<span>工</span>
												<strong>405个</strong>
												<span>评</span>
												<strong>483个</strong>
											</p>
											<p>
												<i>&#xe711;</i>
												<span>${el.company_address}</span>
											</p>
										</div>
										<div class="company-right">
											<strong>口碑值</strong>
											<span>1388</span>
											<strong>好评率</strong>
											<span>99.57%</span>
										</div>
									</dd>
								</dl>
							</a>`;
					$('.recom-cont').append(html);
				})
			}
		});
	}
}
