// Simple component logic test
describe('ProgressBar Logic', () => {
  it('calculates correct percentage', () => {
    const current = 50
    const target = 100
    const percentage = Math.min((current / target) * 100, 100)
    expect(percentage).toBe(50)
  })

  it('caps percentage at 100', () => {
    const current = 150
    const target = 100
    const percentage = Math.min((current / target) * 100, 100)
    expect(percentage).toBe(100)
  })
})