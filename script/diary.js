export default {
	
	
	//发布日记
	addDiary:function(){
		$('#fatie-release').on('click',function(){
			console.log($('#fatie-title').val(),$('#fatie-con').val());
			$.ajax({
				type:"get",
				data:{'talk_title':$('#fatie-title').val(),'talk_content':$('#fatie-con').val()},
				url:"http://www.drehome.com/dreamhome/talk",
				async:true,
				success:function(data){
					$('#fatie-title').val('');
					$('#fatie-con').val('');
					alert("日记发布"+data.msg);
					
				}
			});
		})
	}
	,
	//
	modifyPerson:function(){
		
	}
	
}

