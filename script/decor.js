export default {
//	chaxun
	decorChange:function(){
		if(sessionStorage.getItem('caseStyle')){
			total = sessionStorage.getItem('caseStyle');
		}
		Ajax('田园')
		$('#decRai2').on('click','li',function(){
			var i = $(this).index();
			var n = Array.from($('#decRai2 li strong'));
			console.log(n[i].innerText)
			Ajax(n[i].innerText);
		})
		
		
		
		function Ajax(n){
			$.ajax({
				type:"get",
				data:{'case_style':n},
				url:"http://www.drehome.com/dreamhome/case",
				async:true,
				success:function(data){
					console.log(data);
					
				}
			});
		}
		//分页效果
		var pageData = [1,2,3,45,6,7,8,9,0,1,2,3,45,6,7,8,9,0,1,2,3,45,6,7,8,9,0];
		var Count = pageData.length;//记录条数  
	    var PageSize=5;//设置每页示数目  
	    var PageCount=Math.ceil(Count/PageSize);//计算总页数  
	    var currentPage =1;//当前页，默认为1
	    
	    for(var i=(currentPage-1)*PageSize;i<PageSize*currentPage;i++){    
	        console.log(i) 
	    }  
		    
	    
		$('#dere-right').on('click',function(){
			for(i=(currentPage-1)*PageSize;i<PageSize*currentPage;i++){  
				currentPage++;
				if(currentPage>PageCount){
					currentPage=1
				}
	            for(var i=(currentPage-1)*PageSize;i<PageSize*currentPage;i++){    
			        console.log(i) 
			    } 
	        }  
			$('#dere1').html(currentPage);
		})
		
		$('#dere-left').on('click',function(){
			
			currentPage--;
			if(currentPage<1){
				currentPage=PageCount;
			}
	            for(var i=(currentPage-1)*PageSize;i<PageSize*currentPage;i++){    
			        console.log(i) 
			    } 
			
			$('#dere1').html(currentPage);
		})
		$('#dere2').html(PageCount);//总页数
		$('#dere1').html(currentPage);//分页
	}
	
	
}