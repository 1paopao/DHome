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
	},
	
	//从首页搜索
	search:function(){
		var 
			city = sessionStorage.getItem('city'),
			companyName = sessionStorage.getItem('companyName');
//			console.log(city);
//			console.log(companyName);
		$.ajax({
			type:"get",
			url:"http://www.drehome.com/dreamhome/company",
		    data:{city_name:city,comepany_name:companyName},
		    success:function(data){
//		    	console.log(data.data)
		    }
		});
	},
	//
	detail:function(){
		
		$.ajax({
			type:"get",
			url:"http://www.drehome.com/dreamhome/company",
			data:{"company_name":sessionStorage.getItem('home_company')},
			success:function(data){
				console.log(data.data)
				console.log(sessionStorage.getItem('home_company'))
			}
		});
		
	}
}

