class StorageSFD {
    /**
     * Função para adicionar itens a uma collection 
     * @constructor
     * @param {Object} collection - tag de identificação do itens a ser gravado no localStorage
     * @param {Object} itens - Objeto a ser gravado
     */

    static save(collection, items) {
        try {

            this.resetCollection( collection )
            var stringItens = JSON.stringify(items)
            localStorage.setItem( collection, stringItens)
  
        } catch ( error ) {   console.log(error) 
            return undefined
        }
     }

     static clearAll(){
        localStorage.clear()
    }
  
    /**
     * Função para adicionar item a uma collection 
     * @constructor
     * @param {Object} collection - tag de identificação do item a ser gravado no localStorage
     * @param {Object} item - Objeto a ser gravado
     */
    static resetCollection(collection) {
        localStorage.setItem(collection, [])
    }
 
    /**
     * Função para adicionar item a uma collection 
     * @constructor
     * @param {Object} collection - tag de identificação do item a ser gravado no localStorage
     * @param {Object} item - Objeto a ser gravado
     */
    static getCollection(collection) {
        try {
            var arrayString = localStorage.getItem(collection)
            var array = JSON.parse(arrayString) || []
        
            return array.length == 1 ? array[0] : array.length == 0 ? undefined : array

        } catch ( error ) {   console.log(error) 
            return undefined
        }
    }
    static getArray(collection) {
        try {
            var arrayString = localStorage.getItem(collection)
            var array = JSON.parse(arrayString) || []
        
            return  array.length == 0 ? undefined : array

        } catch ( error ) {   console.log(error) 
            return undefined
        }
    }

}