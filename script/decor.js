export default {
	//	chaxun
	decorChange: function() {
		if(sessionStorage.getItem('caseStyle')) {
			var total = sessionStorage.getItem('caseStyle');
		}
		Ajax('田园')
		$('#decRai2').on('click', 'li', function() {
			var i = $(this).index();
			var n = Array.from($('#decRai2 li strong'));
			console.log(n[i].innerText)
			Ajax(n[i].innerText);
		})
		
		
		//装修攻略ajax查询
		function Ajax(n) {
			$.ajax({
				type: "get",
				data: {
					'case_style': n
				},
				url: "http://www.drehome.com/dreamhome/case",
				async: true,
				success: function(data) {
					
					//数据分页
					var html = '';
//					console.log(data.data);
					var pageData = data.data;
					var Count = pageData.length; //记录条数  
					var PageSize = 12; //设置每页示数目  
					var PageCount = Math.ceil(Count / PageSize); //计算总页数  
					var currentPage = 1; //当前页，默认为1
					//console.log(pageData[0].case_pic)
					if(Count > 12) {
						for(var j = (currentPage - 1) * PageSize; j < PageSize * currentPage; j++) {
//							console.log(j - 1)
//							console.log(pageData[j - 1])
							html += `<li>
									<img src="${pageData[j-1].case_pic}"/>
								</li>`;
						}

						$('#dere-right').on('click', function() {
							html = '';
							for(j = (currentPage - 1) * PageSize; j < PageSize * currentPage; j++) {
								currentPage++;
								if(currentPage > PageCount) {
									currentPage = 1
								}
								for(var j = (currentPage - 1) * PageSize; j < PageSize * currentPage; j++) {
									html += `<li>
										<img src="${pageData[j-1].case_pic}"/>
									</li>`;
								}
							}
							$('#dere1').html(currentPage);
						})

						$('#dere-left').on('click', function() {
							html = '';

							currentPage--;
							if(currentPage < 1) {
								currentPage = PageCount;
							}
							for(var j = (currentPage - 1) * PageSize; j < PageSize * currentPage; j++) {
								html += `<li>
										<img src="${pageData[j-1].case_pic}"/>
									</li>`;
							}

							$('#dere1').html(currentPage);
						})
						$('#dere2').html(PageCount); //总页数
						$('#dere1').html(currentPage); //分页
						$('#decRai-pic ul').html(html);
					}else{
						for(let i in pageData){
							html += `<li>
									<img src="${pageData[i].case_pic}"/>
								</li>`;
						}
						
						$('#decRai-pic ul').html(html);
						
					}
					

				}
			});
		}
	}

}