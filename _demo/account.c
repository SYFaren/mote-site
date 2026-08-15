#include <stdio.h>
#include <stdlib.h>

typedef struct {
    int id;
    char name[64];
    double balance;
} Account;

int compare_accounts(const void *a, const void *b) {
    const Account *acc_a = (const Account *)a;
    const Account *acc_b = (const Account *)b;
    return acc_a->id - acc_b->id;
}

int main(void) {
    Account list[3] = {
        {2, "Ada", 12.5},
        {1, "Lin", 40.0},
        {3, "Ken", 7.25},
    };
    qsort(list, 3, sizeof(Account), compare_accounts);
    for (int i = 0; i < 3; i++)
        printf("%d %s %.2f\n", list[i].id, list[i].name, list[i].balance);
    return 0;
}
