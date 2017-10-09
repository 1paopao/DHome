export default {
	//初始化页面
	init:function() {
		//获取公司的id
		var 
			str  = window.location.search.substring(1,2),
			surl = 'http://www.drehome.com/dreamhome/companymain',
			arr  = [],
			obj  = {};
		//获取数据
<<<<<<< HEAD
	},
	
	
	detail:function(){
		//id
		var urls = location.href.split('=')[1];
//		console.log(urls)
		
//		$.ajax({
//			type:"get",
//			url:"http://www.drehome.com/dreamhome/talkmain",
//			success:function(data){
//				console.log(data)
//			}
//		});
=======
		$.get(surl,function(data){
			var 
				oData = data.data;
				
				//遍历数组
				for(var j = 0,len = oData.length; j < len; j++) {
					//判断id是否相等
					if(str == oData[j].company_id) {
						$('.comp-top dt').append(`<img src="${oData[j].company_pic}"/>`);
					}
				}
				
		})
>>>>>>> 83a913ac8e2b32d5f482eb33cd7cea0fefad930a
	}
}

