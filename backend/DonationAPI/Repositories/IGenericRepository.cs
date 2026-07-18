using System.Linq.Expressions;

namespace DonationAPI.Repositories
{
    public interface IGenericRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        IQueryable<T> Query();
        Task AddAsync(T entity);
        void Update(T entity);
        void Remove(T entity);
        Task<int> SaveChangesAsync();
    }
}
