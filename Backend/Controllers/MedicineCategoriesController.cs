using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AutoMapper;
using ReactPharmacyPortal.Models;
using ReactPharmacyPortal.DTOs;
using ReactPharmacyPortal.Interfaces.Services;

namespace ReactPharmacyPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MedicineCategoriesController : ControllerBase
    {
        private readonly IMedicineCategoryService _categoryService;
        private readonly IMapper _mapper;

        public MedicineCategoriesController(IMedicineCategoryService categoryService, IMapper mapper)
        {
            _categoryService = categoryService;
            _mapper = mapper;
        }

      
        [HttpGet]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<IEnumerable<MedicineCategoryDTO>>> GetCategories()
        {
            try
            {
                var categories = await _categoryService.GetAllAsync();
                return Ok(_mapper.Map<IEnumerable<MedicineCategoryDTO>>(categories));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

       
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Customer,Pharmacist")]
        public async Task<ActionResult<MedicineCategoryDTO>> GetCategory(int id)
        {
            try
            {
                var category = await _categoryService.GetByIdAsync(id);
                if (category == null) return NotFound(new { message = "Category not found" });
                return Ok(_mapper.Map<MedicineCategoryDTO>(category));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

       
        [HttpPost]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<ActionResult<MedicineCategoryDTO>> CreateCategory(CreateMedicineCategoryDto categoryDto)
        {
            try
            {
                var createdCategory = await _categoryService.CreateAsync(categoryDto);
                return CreatedAtAction(nameof(GetCategory), new { id = createdCategory.CategoryId }, createdCategory);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Pharmacist")]
        public async Task<IActionResult> UpdateCategory(int id, UpdateMedicineCategoryDto categoryDto)
        {
            try
            {
                await _categoryService.UpdateAsync(id, categoryDto);
                return Ok(new { message = "Category updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

       
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            try
            {
                await _categoryService.DeleteAsync(id);
                return Ok(new { message = "Category deleted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}